import type { TRPCRouterRecord } from "@trpc/server";

import { asc } from "@ioyou/db";
import { recordStatuses } from "@ioyou/db/schema";

import { protectedProcedure } from "../trpc";

export const recordStatusRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.recordStatuses.findMany({
      orderBy: asc(recordStatuses.code),
    });
  }),
} satisfies TRPCRouterRecord;
