import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@ioyou/ui/button";

import { AddPersonDialog } from "./add-person-dialog";

export function AddPersonButton() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsAddOpen(true)}>
        <Plus />
        Add Person
      </Button>

      <AddPersonDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
