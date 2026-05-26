import { TRPCError } from "@trpc/server";

import type { db as _db } from "@ioyou/db/client";
import { and, eq } from "@ioyou/db";
import { ledgerMembers, ledgers } from "@ioyou/db/schema";

/**
 * Encapsulates the authorization rule "the current user is a member of this
 * ledger." A user is a member if they created it (private ledgers, and the
 * inviter side of shared ledgers) or hold a `ledger_member` row (shared).
 *
 * Returns the ledger row, or throws NOT_FOUND so callers never reveal the
 * existence of ledgers the user can't access.
 */
export async function assertLedgerAccess(
  db: typeof _db,
  ledgerId: string,
  userId: string,
) {
  const ledger = await db.query.ledgers.findFirst({
    where: eq(ledgers.id, ledgerId),
  });

  if (ledger) {
    if (ledger.createdBy === userId) return ledger;

    const membership = await db.query.ledgerMembers.findFirst({
      where: and(
        eq(ledgerMembers.ledgerId, ledgerId),
        eq(ledgerMembers.userId, userId),
      ),
    });
    if (membership) return ledger;
  }

  throw new TRPCError({ code: "NOT_FOUND", message: "Ledger not found" });
}
