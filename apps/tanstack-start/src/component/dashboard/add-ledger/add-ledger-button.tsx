import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@ioyou/ui/button";

import { AddLedgerDialog } from "./add-ledger-dialog";

export function AddLedgerButton() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsAddOpen(true)}>
        <Plus />
        Add Ledger
      </Button>

      <AddLedgerDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
