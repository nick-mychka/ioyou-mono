import { Users } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ioyou/ui/empty";

import { AddLedgerButton } from "../add-ledger/add-ledger-button";

export function LedgersEmpty() {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Users />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No ledgers yet</EmptyTitle>
        <EmptyDescription>
          Start by creating a ledger for someone you owe money to or who owes
          you. Track balances and settle up easily.
        </EmptyDescription>
      </EmptyHeader>
      <AddLedgerButton />
    </Empty>
  );
}
