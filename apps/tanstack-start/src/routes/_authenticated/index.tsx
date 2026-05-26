import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@ioyou/ui/separator";

import { LedgerView } from "~/component/dashboard/ledger-view/ledger-view";
import { LedgersSidebar } from "~/component/dashboard/ledgers/ledgers-sidebar";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="grid grow grid-cols-[clamp(20rem,40%,35rem)_1px_1fr] gap-6">
      <LedgersSidebar />
      <Separator orientation="vertical" className="self-stretch" />
      <LedgerView />
    </main>
  );
}
