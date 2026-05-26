import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@ioyou/ui/skeleton";

import { useTRPC } from "~/lib/trpc";
import { AddLedgerButton } from "../add-ledger/add-ledger-button";
import { LedgerList } from "./ledger-list";
import { LedgersEmpty } from "./ledgers-empty";

export function LedgersSidebar() {
  const trpc = useTRPC();
  const { data, isLoading, isSuccess } = useQuery(
    trpc.ledger.list.queryOptions(),
  );

  const hasLedgers = isSuccess && data.length > 0;

  return (
    <section className="flex flex-col">
      {isLoading || hasLedgers ? (
        <>
          <header className="flex items-center justify-between px-6 py-8">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <h2 className="text-2xl font-semibold">Ledgers</h2>
            )}
            {isLoading ? (
              <Skeleton className="h-9 w-31" />
            ) : (
              <AddLedgerButton />
            )}
          </header>
          <LedgerList ledgers={data} isLoading={isLoading} />
        </>
      ) : (
        <LedgersEmpty />
      )}
    </section>
  );
}
