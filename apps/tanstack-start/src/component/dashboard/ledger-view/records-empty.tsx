import { Plus, Receipt } from "lucide-react";

import { Button } from "@ioyou/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@ioyou/ui/empty";

export function RecordsEmpty({ onAddRecord }: { onAddRecord: () => void }) {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Receipt />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No records yet</EmptyTitle>
        <EmptyDescription>
          Add your first record to start tracking loans and debts in this
          ledger.
        </EmptyDescription>
      </EmptyHeader>
      <Button onClick={onAddRecord}>
        <Plus />
        Add Record
      </Button>
    </Empty>
  );
}
