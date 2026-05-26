import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable, unique } from "drizzle-orm/pg-core";
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

// A ledger is either a user's private notes about a contact, or a history
// co-managed by two real users (shared).
export const ledgerTypeEnum = pgEnum("ledger_type", ["private", "shared"]);

// Records are part of the agreed history when `auto` (private ledgers) or
// `confirmed` (shared ledgers, after the counterparty agrees).
export const confirmationStatusEnum = pgEnum("confirmation_status", [
  "auto",
  "pending",
  "confirmed",
  "rejected",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

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

// Ledgers
export const ledgers = pgTable("ledgers", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  type: ledgerTypeEnum().notNull().default("private"),
  // Set for private ledgers only — the contact's display name. Null for shared
  // ledgers, where each member names the counterparty themselves (see members).
  name: t.text(),
  createdBy: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

// Ledger Schemas
export const ledgerSelectSchema = createSelectSchema(ledgers);

// Private ledger creation: only the contact name is user-supplied.
export const createPrivateLedgerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

// Ledger members — one row per participant of a shared ledger, holding that
// participant's own display name for the counterparty.
export const ledgerMembers = pgTable(
  "ledger_members",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    ledgerId: t
      .uuid()
      .notNull()
      .references(() => ledgers.id, { onDelete: "cascade" }),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    displayName: t.text().notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (table) => [unique().on(table.ledgerId, table.userId)],
);

// Ledger invitations — tokenized invite to join a shared ledger.
export const ledgerInvitations = pgTable("ledger_invitations", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  ledgerId: t
    .uuid()
    .notNull()
    .references(() => ledgers.id, { onDelete: "cascade" }),
  inviterId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: t.text().notNull().unique(),
  inviteeEmail: t.text(),
  inviterDisplayName: t.text().notNull(),
  status: invitationStatusEnum().notNull().default("pending"),
  expiresAt: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  acceptedBy: t.text().references(() => user.id, { onDelete: "set null" }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

// Records
export const records = pgTable("records", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  ledgerId: t
    .uuid()
    .notNull()
    .references(() => ledgers.id, { onDelete: "cascade" }),
  // The user who proposed/created the record. `kind` is stored from this
  // user's perspective and rendered per-viewer.
  createdBy: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: t.numeric().notNull(),
  currencyId: t
    .uuid()
    .notNull()
    .references(() => currencies.id),
  note: t.text(),
  loanDate: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  dueDate: t.timestamp({ mode: "date", withTimezone: true }),
  kind: recordKindEnum().notNull(),
  confirmationStatus: confirmationStatusEnum().notNull().default("auto"),
  statusId: t
    .uuid()
    .notNull()
    .references(() => recordStatuses.id),
  interestRate: t.numeric(),
  penalty: t.numeric(),
}));

// Record Schemas
export const recordSelectSchema = createSelectSchema(records);

export const createRecordSchema = createInsertSchema(records, {
  ledgerId: z.uuid(),
}).omit({
  id: true,
  createdBy: true,
  confirmationStatus: true,
  statusId: true,
});

export const updateRecordSchema = createUpdateSchema(records, {
  id: z.uuid(),
  ledgerId: z.uuid(),
}).omit({
  createdBy: true,
  confirmationStatus: true,
  statusId: true,
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ledgers: many(ledgers),
  ledgerMemberships: many(ledgerMembers),
}));

export const ledgersRelations = relations(ledgers, ({ one, many }) => ({
  creator: one(user, {
    fields: [ledgers.createdBy],
    references: [user.id],
  }),
  members: many(ledgerMembers),
  records: many(records),
  invitations: many(ledgerInvitations),
}));

export const ledgerMembersRelations = relations(ledgerMembers, ({ one }) => ({
  ledger: one(ledgers, {
    fields: [ledgerMembers.ledgerId],
    references: [ledgers.id],
  }),
  user: one(user, {
    fields: [ledgerMembers.userId],
    references: [user.id],
  }),
}));

export const ledgerInvitationsRelations = relations(
  ledgerInvitations,
  ({ one }) => ({
    ledger: one(ledgers, {
      fields: [ledgerInvitations.ledgerId],
      references: [ledgers.id],
    }),
    inviter: one(user, {
      fields: [ledgerInvitations.inviterId],
      references: [user.id],
    }),
  }),
);

export const recordsRelations = relations(records, ({ one }) => ({
  ledger: one(ledgers, {
    fields: [records.ledgerId],
    references: [ledgers.id],
  }),
  creator: one(user, {
    fields: [records.createdBy],
    references: [user.id],
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
