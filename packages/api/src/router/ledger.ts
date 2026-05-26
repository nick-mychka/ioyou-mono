import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { desc, eq, inArray, or } from "@ioyou/db";
import {
  createPrivateLedgerSchema,
  ledgerMembers,
  ledgers,
} from "@ioyou/db/schema";

import type { BalanceRecord } from "../balance";
import { computeLedgerBalance } from "../balance";
import { assertLedgerAccess } from "../lib/ledgers";
import { protectedProcedure } from "../trpc";

export const ledgerRouter = {
  // List the current user's ledgers, each with its per-currency confirmed
  // balance (viewer-relative) and a count of records awaiting their action.
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const memberships = await ctx.db.query.ledgerMembers.findMany({
      where: eq(ledgerMembers.userId, userId),
      columns: { ledgerId: true },
    });
    const memberLedgerIds = memberships.map((m) => m.ledgerId);

    const myLedgers = await ctx.db.query.ledgers.findMany({
      where: or(
        eq(ledgers.createdBy, userId),
        memberLedgerIds.length > 0
          ? inArray(ledgers.id, memberLedgerIds)
          : undefined,
      ),
      orderBy: desc(ledgers.createdAt),
      with: {
        members: true,
        records: {
          with: { currency: { columns: { code: true } } },
        },
      },
    });

    return myLedgers.map((ledger) => {
      const balanceRecords: BalanceRecord[] = ledger.records.map((r) => ({
        id: r.id,
        amount: r.amount,
        kind: r.kind,
        createdBy: r.createdBy,
        confirmationStatus: r.confirmationStatus,
        currencyCode: r.currency.code,
      }));

      const { byCurrency } = computeLedgerBalance(balanceRecords, userId);

      const pendingAwaitingMeCount = ledger.records.filter(
        (r) => r.confirmationStatus === "pending" && r.createdBy !== userId,
      ).length;

      const { records: _records, ...rest } = ledger;
      return { ...rest, balance: byCurrency, pendingAwaitingMeCount };
    });
  }),

  // Fetch a single ledger with its members and records. Membership-checked.
  byId: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await assertLedgerAccess(ctx.db, input.id, userId);

      const ledger = await ctx.db.query.ledgers.findFirst({
        where: eq(ledgers.id, input.id),
        with: {
          members: true,
          records: {
            orderBy: (r, { desc: d }) => d(r.loanDate),
            with: { currency: true, status: true },
          },
        },
      });
      // assertLedgerAccess already guaranteed existence + access; this guards
      // the type and a vanishingly unlikely concurrent delete.
      if (!ledger) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ledger not found" });
      }
      return ledger;
    }),

  createPrivate: protectedProcedure
    .input(createPrivateLedgerSchema)
    .mutation(async ({ ctx, input }) => {
      const [ledger] = await ctx.db
        .insert(ledgers)
        .values({
          type: "private",
          name: input.name,
          createdBy: ctx.session.user.id,
        })
        .returning();
      return ledger;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Only the creator may delete a private ledger.
      const ledger = await assertLedgerAccess(
        ctx.db,
        input.id,
        ctx.session.user.id,
      );
      if (ledger.type !== "private") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Shared ledgers cannot be deleted.",
        });
      }
      const [deleted] = await ctx.db
        .delete(ledgers)
        .where(eq(ledgers.id, input.id))
        .returning();
      return deleted;
    }),
} satisfies TRPCRouterRecord;
