import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@ioyou/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ioyou/ui/dialog";
import { Field, FieldError } from "@ioyou/ui/field";
import { Input } from "@ioyou/ui/input";
import { Label } from "@ioyou/ui/label";
import { Spinner } from "@ioyou/ui/spinner";

import { useTRPC } from "~/lib/trpc";
import { useLedgerStore } from "~/store/use-ledger-store";

interface ContentProps {
  onOpenChange: (open: boolean) => void;
}

interface Props extends ContentProps {
  open: boolean;
}

export function AddLedgerDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AddLedgerDialogContent onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function AddLedgerDialogContent({ onOpenChange }: ContentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const setLedgerId = useLedgerStore((s) => s.setLedgerId);

  const [name, setName] = useState("");

  const createLedger = useMutation(
    trpc.ledger.createPrivate.mutationOptions({
      onSuccess: async (ledger) => {
        toast.success("Ledger created successfully");

        await queryClient.invalidateQueries({
          queryKey: trpc.ledger.list.queryKey(),
        });

        if (ledger) setLedgerId(ledger.id);
        onOpenChange(false);
        setName("");
      },
      onError: () => {
        toast.error("Failed to create ledger");
      },
    }),
  );

  const isSubmitDisabled = createLedger.isPending || name.trim() === "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    createLedger.mutate({ name: name.trim() });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Ledger</DialogTitle>
        <DialogDescription>
          Create a private ledger to track money with a contact.
        </DialogDescription>
      </DialogHeader>

      <form
        id="add-ledger-form"
        className="flex flex-col gap-6 py-2"
        onSubmit={handleSubmit}
      >
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter a contact name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {createLedger.error && (
            <FieldError>{createLedger.error.message}</FieldError>
          )}
        </Field>
      </form>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-ledger-form"
          disabled={isSubmitDisabled}
        >
          {createLedger.isPending && <Spinner />}
          Add
        </Button>
      </DialogFooter>
    </>
  );
}
