import type { CurrencyBalance } from "@ioyou/api/balance";

import { formatAmount } from "./format";

export type BalanceTone = "owed_to_viewer" | "owed_by_viewer" | "settled";

export interface BalanceLine {
  currencyCode: string;
  /** Human-readable phrasing from the viewer's perspective. */
  text: string;
  tone: BalanceTone;
}

/**
 * Turn a per-currency confirmed balance into viewer-relative phrasing —
 * "X owes you" / "you owe X" / "settled".
 */
export function toBalanceLine(
  balance: CurrencyBalance,
  counterpartyName: string,
): BalanceLine {
  const { confirmedNet, currencyCode } = balance;
  const magnitude = `${formatAmount(Math.abs(confirmedNet))} ${currencyCode}`;

  if (confirmedNet > 0) {
    return {
      currencyCode,
      text: `${counterpartyName} owes you ${magnitude}`,
      tone: "owed_to_viewer",
    };
  }
  if (confirmedNet < 0) {
    return {
      currencyCode,
      text: `You owe ${counterpartyName} ${magnitude}`,
      tone: "owed_by_viewer",
    };
  }
  return { currencyCode, text: `Settled (${currencyCode})`, tone: "settled" };
}

export function toBalanceLines(
  balances: CurrencyBalance[],
  counterpartyName: string,
): BalanceLine[] {
  return balances.map((b) => toBalanceLine(b, counterpartyName));
}
