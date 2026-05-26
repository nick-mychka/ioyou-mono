import type { CurrencyBalance } from "@ioyou/api/balance";
import { cn } from "@ioyou/ui";
import { Card, CardDescription, CardHeader, CardTitle } from "@ioyou/ui/card";

import { formatAmount } from "~/lib/format";

/**
 * A single net per-currency balance, viewer-relative: "X owes you" /
 * "you owe X" / "settled". Replaces the old separate lent/borrowed cards.
 */
export function BalanceCard({
  balance,
  counterpartyName,
}: {
  balance: CurrencyBalance;
  counterpartyName: string;
}) {
  const net = balance.confirmedNet;
  const tone = net > 0 ? "positive" : net < 0 ? "negative" : "settled";

  const label =
    tone === "positive"
      ? `${counterpartyName} owes you`
      : tone === "negative"
        ? `You owe ${counterpartyName}`
        : "Settled";

  return (
    <Card
      className={cn(
        "min-w-44 grow-0 basis-44 gap-0 overflow-hidden border-b-4 py-0",
        tone === "negative" && "border-b-red-400 bg-red-400/5",
        tone === "positive" && "border-b-green-400 bg-green-400/5",
        tone === "settled" && "border-b-muted-foreground/30",
      )}
    >
      <CardHeader className="py-3">
        <CardDescription className="text-foreground/60">
          {label}
        </CardDescription>
        <CardTitle className="flex items-baseline gap-1">
          <span className="text-xl">{formatAmount(Math.abs(net))}</span>
          <span className="text-muted-foreground text-sm">
            {balance.currencyCode}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
