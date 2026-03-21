import { cn } from "@ioyou/ui";
import { Card, CardDescription, CardHeader, CardTitle } from "@ioyou/ui/card";

import { formatAmount } from "~/lib/format";

interface RecordTotal {
  kind: "loan" | "debt";
  currencyCode: string;
  total: number;
}

export function RecordTotalCard({ total }: { total: RecordTotal }) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-b-4 py-0",
        total.kind === "debt"
          ? "border-b-red-400 bg-red-400/5"
          : "border-b-green-400 bg-green-400/5",
      )}
    >
      <CardHeader className="py-3">
        <CardDescription className="text-foreground/60">
          {total.kind === "debt" ? "Total Borrowed" : "Total Lent"}
        </CardDescription>
        <CardTitle className="flex items-baseline gap-1">
          <span className="text-xl">{formatAmount(total.total)}</span>
          <span className="text-muted-foreground text-sm">
            {total.currencyCode}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
