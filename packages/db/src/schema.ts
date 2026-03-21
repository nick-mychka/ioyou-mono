import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  verification,
} from "./auth-schema";

export { account, session, user, verification };

export const recordKindEnum = pgEnum("record_kind", ["loan", "debt"]);

// Currency
export const currencies = pgTable("currencies", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  code: t.text().notNull().unique(),
}));

// Currency Schemas
export const currencySelectSchema = createSelectSchema(currencies);
export const createCurrencySchema = createInsertSchema(currencies).omit({
  id: true,
});

// Record Status
export const recordStatuses = pgTable("record_statuses", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  code: t.text().notNull().unique(),
}));

// People
export const people = pgTable("people", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.text().notNull(),
  email: t.text(),
  description: t.text(),
  createdBy: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

// People Schemas
export const personSelectSchema = createSelectSchema(people);

export const createPersonSchema = createInsertSchema(people).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePersonSchema = createUpdateSchema(people, {
  id: z.uuid(),
}).omit({
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

// Records
export const records = pgTable("records", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  personId: t
    .uuid()
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  amount: t.numeric().notNull(),
  currencyId: t
    .uuid()
    .notNull()
    .references(() => currencies.id),
  note: t.text(),
  loanDate: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  dueDate: t.timestamp({ mode: "date", withTimezone: true }),
  kind: recordKindEnum().notNull(),
  statusId: t
    .uuid()
    .notNull()
    .references(() => recordStatuses.id),
  interestRate: t.numeric(),
  penalty: t.numeric(),
}));

// Record Schemas
export const recordSelectSchema = createSelectSchema(records);

export const createRecordSchema = createInsertSchema(records).omit({
  id: true,
  statusId: true,
});

export const updateRecordSchema = createUpdateSchema(records, {
  id: z.uuid(),
  personId: z.uuid(),
}).omit({
  statusId: true,
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  people: many(people),
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  creator: one(user, {
    fields: [people.createdBy],
    references: [user.id],
  }),
  records: many(records),
}));

export const recordsRelations = relations(records, ({ one }) => ({
  person: one(people, {
    fields: [records.personId],
    references: [people.id],
  }),
  currency: one(currencies, {
    fields: [records.currencyId],
    references: [currencies.id],
  }),
  status: one(recordStatuses, {
    fields: [records.statusId],
    references: [recordStatuses.id],
  }),
}));

export const currenciesRelations = relations(currencies, ({ many }) => ({
  records: many(records),
}));

export const recordStatusesRelations = relations(
  recordStatuses,
  ({ many }) => ({
    records: many(records),
  }),
);

export { accountRelations, sessionRelations };
