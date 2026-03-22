import { createFileRoute } from "@tanstack/react-router";

import { Separator } from "@ioyou/ui/separator";

import { PeopleSidebar } from "~/component/dashboard/people/people-sidebar";
import { PersonView } from "~/component/dashboard/person-view/person-view";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="grid grow grid-cols-[clamp(20rem,40%,35rem)_1px_1fr] gap-6">
      <PeopleSidebar />
      <Separator orientation="vertical" className="self-stretch" />
      <PersonView />
    </main>
  );
}
