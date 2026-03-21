import type { TRPCRouterRecord } from "@trpc/server";

import { asc } from "@ioyou/db";
import { createCurrencySchema, currencies } from "@ioyou/db/schema";

import { protectedProcedure } from "../trpc";

export const currencyRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.currencies.findMany({
      orderBy: asc(currencies.code),
    });
  }),

  create: protectedProcedure
    .input(createCurrencySchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(currencies)
        .values({ code: input.code.toUpperCase() })
        .onConflictDoNothing()
        .returning();
    }),
} satisfies TRPCRouterRecord;
