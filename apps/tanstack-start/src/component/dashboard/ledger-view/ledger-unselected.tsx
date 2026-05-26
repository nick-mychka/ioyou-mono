import { BookUser } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ioyou/ui/empty";

export function LedgerUnselected() {
  return (
    <Empty className="h-full">
      <EmptyMedia variant="icon">
        <BookUser />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No ledger selected</EmptyTitle>
        <EmptyDescription>
          Select a ledger from the list to view its balance and records.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
