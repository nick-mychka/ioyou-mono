import { Plus, Receipt } from "lucide-react";

import { Button } from "@ioyou/ui/button";

export function RecordsEmpty({ onAddRecord }: { onAddRecord: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Receipt className="text-muted-foreground size-10" />
      <div className="text-center">
        <p className="font-medium">No records yet</p>
        <p className="text-muted-foreground text-sm">
          Add your first record to start tracking loans and debts
        </p>
      </div>
      <Button onClick={onAddRecord}>
        <Plus className="size-4" />
        Add Record
      </Button>
    </div>
  );
}
