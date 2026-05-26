/**
 * Pure balance & direction helper.
 *
 * Given a set of records and the identity of the viewing user, it returns each
 * record's direction *from the viewer's perspective* and the per-currency net
 * balance. The net counts only records that are part of the agreed history
 * (`auto` for private ledgers, `confirmed` for shared); `pending` records are
 * summed into a separate subtotal and `rejected` records are ignored.
 *
 * This module has no database or request dependency — it is pure and testable
 * in isolation.
 */

export type RecordKind = "loan" | "debt";
export type ConfirmationStatus = "auto" | "pending" | "confirmed" | "rejected";

/** A record's direction from the viewer's perspective. */
export type Direction = "owed_to_viewer" | "owed_by_viewer";

export interface BalanceRecord {
  id: string;
  amount: string | number;
  /** `kind` is stored from the creator's perspective. */
  kind: RecordKind;
  createdBy: string;
  confirmationStatus: ConfirmationStatus;
  currencyCode: string;
}

export interface CurrencyBalance {
  currencyCode: string;
  /**
   * Net of the agreed history, in viewer-relative terms: positive means the
   * counterparty owes the viewer, negative means the viewer owes them.
   */
  confirmedNet: number;
  /** Same convention, summed over records still awaiting confirmation. */
  pendingNet: number;
}

export interface LedgerBalance {
  /** Per-record direction from the viewer's perspective, keyed by record id. */
  directions: Record<string, Direction>;
  /** Net per currency, sorted by currency code. */
  byCurrency: CurrencyBalance[];
}

/**
 * Resolve a record's direction for a viewer. `kind` is stored from the
 * creator's perspective, so when the viewer is not the creator it flips:
 * the creator lending to the counterparty means the counterparty (viewer)
 * owes the creator.
 */
export function directionForViewer(
  record: Pick<BalanceRecord, "kind" | "createdBy">,
  viewerId: string,
): Direction {
  const viewerIsCreator = record.createdBy === viewerId;
  const viewerLent = viewerIsCreator
    ? record.kind === "loan"
    : record.kind === "debt";
  return viewerLent ? "owed_to_viewer" : "owed_by_viewer";
}

export function computeLedgerBalance(
  records: BalanceRecord[],
  viewerId: string,
): LedgerBalance {
  const directions: Record<string, Direction> = {};
  const currencyMap = new Map<string, CurrencyBalance>();

  for (const record of records) {
    if (record.confirmationStatus === "rejected") continue;

    const direction = directionForViewer(record, viewerId);
    directions[record.id] = direction;

    const amount = Number(record.amount);
    const signed = direction === "owed_to_viewer" ? amount : -amount;

    let balance = currencyMap.get(record.currencyCode);
    if (!balance) {
      balance = {
        currencyCode: record.currencyCode,
        confirmedNet: 0,
        pendingNet: 0,
      };
      currencyMap.set(record.currencyCode, balance);
    }

    if (record.confirmationStatus === "pending") {
      balance.pendingNet += signed;
    } else {
      // `auto` or `confirmed` — part of the agreed history.
      balance.confirmedNet += signed;
    }
  }

  const byCurrency = Array.from(currencyMap.values()).sort((a, b) =>
    a.currencyCode.localeCompare(b.currencyCode),
  );

  return { directions, byCurrency };
}
