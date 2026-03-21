import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { db as _db } from "@ioyou/db/client";
import { and, desc, eq } from "@ioyou/db";
import {
  createRecordSchema,
  people,
  records,
  recordStatuses,
  updateRecordSchema,
} from "@ioyou/db/schema";

import { protectedProcedure } from "../trpc";

async function verifyPersonOwnership(
  db: typeof _db,
  personId: string,
  userId: string,
) {
  const person = await db.query.people.findFirst({
    where: and(eq(people.id, personId), eq(people.createdBy, userId)),
  });
  if (!person) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Person not found" });
  }
  return person;
}

export const recordRouter = {
  allByPerson: protectedProcedure
    .input(z.object({ personId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyPersonOwnership(ctx.db, input.personId, ctx.session.user.id);
      return ctx.db.query.records.findMany({
        where: eq(records.personId, input.personId),
        orderBy: desc(records.loanDate),
        with: {
          currency: true,
          status: true,
        },
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.uuid(), personId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyPersonOwnership(ctx.db, input.personId, ctx.session.user.id);
      const record = await ctx.db.query.records.findFirst({
        where: and(
          eq(records.id, input.id),
          eq(records.personId, input.personId),
        ),
        with: {
          currency: true,
          status: true,
        },
      });
      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Record not found",
        });
      }
      return record;
    }),

  create: protectedProcedure
    .input(createRecordSchema)
    .mutation(async ({ ctx, input }) => {
      await verifyPersonOwnership(ctx.db, input.personId, ctx.session.user.id);

      // Look up 'active' status
      const activeStatus = await ctx.db.query.recordStatuses.findFirst({
        where: eq(recordStatuses.code, "active"),
      });
      if (!activeStatus) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Active status not found. Run the seed script first.",
        });
      }

      const [record] = await ctx.db
        .insert(records)
        .values({
          ...input,
          statusId: activeStatus.id,
        })
        .returning();
      return record;
    }),

  update: protectedProcedure
    .input(updateRecordSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, personId, ...data } = input;
      await verifyPersonOwnership(ctx.db, personId, ctx.session.user.id);

      const [updated] = await ctx.db
        .update(records)
        .set(data)
        .where(and(eq(records.id, id), eq(records.personId, personId)))
        .returning();
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Record not found",
        });
      }
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid(), personId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      await verifyPersonOwnership(ctx.db, input.personId, ctx.session.user.id);

      const [deleted] = await ctx.db
        .delete(records)
        .where(
          and(eq(records.id, input.id), eq(records.personId, input.personId)),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Record not found",
        });
      }
      return deleted;
    }),
} satisfies TRPCRouterRecord;
