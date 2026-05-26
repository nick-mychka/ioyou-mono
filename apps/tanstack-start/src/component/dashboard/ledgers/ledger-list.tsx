import type { RouterOutputs } from "@ioyou/api";

import { LedgerListItem, LedgerListItemSkeleton } from "./ledger-list-item";

type Ledger = RouterOutputs["ledger"]["list"][number];

export function LedgerList({
  ledgers,
  isLoading,
}: {
  ledgers: Ledger[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 px-2">
        {Array.from({ length: 3 }, (_, i) => (
          <LedgerListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-2">
      {ledgers?.map((ledger) => (
        <LedgerListItem key={ledger.id} ledger={ledger} />
      ))}
    </div>
  );
}
