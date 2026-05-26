import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { db as _db } from "@ioyou/db/client";
import { and, desc, eq } from "@ioyou/db";
import {
  createRecordSchema,
  records,
  recordStatuses,
  updateRecordSchema,
} from "@ioyou/db/schema";

import { assertLedgerAccess } from "../lib/ledgers";
import { protectedProcedure } from "../trpc";

async function getActiveStatusId(db: typeof _db) {
  const activeStatus = await db.query.recordStatuses.findFirst({
    where: eq(recordStatuses.code, "active"),
  });
  if (!activeStatus) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Active status not found. Run the seed script first.",
    });
  }
  return activeStatus.id;
}

/**
 * Load a record the user may modify, enforcing ledger access and the rule
 * "edit/delete only your own pending or private (`auto`) records." Confirmed
 * records are immutable — corrections are made by adding a new record.
 */
async function getEditableRecord(
  db: typeof _db,
  recordId: string,
  userId: string,
) {
  const record = await db.query.records.findFirst({
    where: eq(records.id, recordId),
  });
  if (!record) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
  }
  await assertLedgerAccess(db, record.ledgerId, userId);

  if (record.createdBy !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can only modify records you created.",
    });
  }
  if (record.confirmationStatus === "confirmed") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Confirmed records are immutable. Add a correcting record instead.",
    });
  }
  return record;
}

export const recordRouter = {
  allByLedger: protectedProcedure
    .input(z.object({ ledgerId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      await assertLedgerAccess(ctx.db, input.ledgerId, ctx.session.user.id);
      return ctx.db.query.records.findMany({
        where: eq(records.ledgerId, input.ledgerId),
        orderBy: desc(records.loanDate),
        with: {
          currency: true,
          status: true,
        },
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.uuid(), ledgerId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      await assertLedgerAccess(ctx.db, input.ledgerId, ctx.session.user.id);
      const record = await ctx.db.query.records.findFirst({
        where: and(
          eq(records.id, input.id),
          eq(records.ledgerId, input.ledgerId),
        ),
        with: {
          currency: true,
          status: true,
        },
      });
      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }
      return record;
    }),

  // Create a record in a private ledger. It is immediately part of the agreed
  // history (`confirmationStatus = auto`). Shared-ledger creation (which starts
  // `pending`) is added in a later phase.
  create: protectedProcedure
    .input(createRecordSchema)
    .mutation(async ({ ctx, input }) => {
      const ledger = await assertLedgerAccess(
        ctx.db,
        input.ledgerId,
        ctx.session.user.id,
      );
      if (ledger.type !== "private") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Use createShared to add records to a shared ledger.",
        });
      }

      const statusId = await getActiveStatusId(ctx.db);

      const [record] = await ctx.db
        .insert(records)
        .values({
          ...input,
          createdBy: ctx.session.user.id,
          confirmationStatus: "auto",
          statusId,
        })
        .returning();
      return record;
    }),

  update: protectedProcedure
    .input(updateRecordSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ledgerId: _ledgerId, ...data } = input;
      await getEditableRecord(ctx.db, id, ctx.session.user.id);

      const [updated] = await ctx.db
        .update(records)
        .set(data)
        .where(eq(records.id, id))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      await getEditableRecord(ctx.db, input.id, ctx.session.user.id);

      const [deleted] = await ctx.db
        .delete(records)
        .where(eq(records.id, input.id))
        .returning();
      return deleted;
    }),
} satisfies TRPCRouterRecord;
