import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@ioyou/db";
import {
  createPersonSchema,
  people,
  updatePersonSchema,
} from "@ioyou/db/schema";

import { protectedProcedure } from "../trpc";

export const personRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.people.findMany({
      where: eq(people.createdBy, ctx.session.user.id),
      orderBy: desc(people.createdAt),
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const person = await ctx.db.query.people.findFirst({
        where: and(
          eq(people.id, input.id),
          eq(people.createdBy, ctx.session.user.id),
        ),
      });
      if (!person) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Person not found" });
      }
      return person;
    }),

  create: protectedProcedure
    .input(createPersonSchema)
    .mutation(async ({ ctx, input }) => {
      const [person] = await ctx.db
        .insert(people)
        .values({
          ...input,
          createdBy: ctx.session.user.id,
        })
        .returning();
      return person;
    }),

  update: protectedProcedure
    .input(updatePersonSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(people)
        .set(data)
        .where(
          and(eq(people.id, id), eq(people.createdBy, ctx.session.user.id)),
        )
        .returning();
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Person not found" });
      }
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(people)
        .where(
          and(
            eq(people.id, input.id),
            eq(people.createdBy, ctx.session.user.id),
          ),
        )
        .returning();
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Person not found" });
      }
      return deleted;
    }),
} satisfies TRPCRouterRecord;
