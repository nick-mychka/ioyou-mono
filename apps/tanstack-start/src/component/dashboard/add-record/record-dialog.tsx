import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BanknoteArrowDown, BanknoteArrowUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import type { RouterOutputs } from "@ioyou/api";
import { cn } from "@ioyou/ui";
import { Button } from "@ioyou/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ioyou/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ioyou/ui/dialog";
import { Input } from "@ioyou/ui/input";
import { Label } from "@ioyou/ui/label";
import { Spinner } from "@ioyou/ui/spinner";
import { Textarea } from "@ioyou/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@ioyou/ui/toggle-group";

import { useTRPC } from "~/lib/trpc";
import { CurrencyCombobox } from "./currency-combobox";
import { DateField } from "./date-field";

type LedgerRecord = RouterOutputs["record"]["allByLedger"][number];

interface ContentProps {
  ledgerId: string;
  record?: LedgerRecord;
  onOpenChange: (open: boolean) => void;
}

export function RecordDialog({
  open,
  onOpenChange,
  ledgerId,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ledgerId: string;
  /** When provided, the dialog edits this record instead of creating one. */
  record?: LedgerRecord;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Mounted only while open, so state initializes fresh from `record`. */}
        <RecordDialogContent
          ledgerId={ledgerId}
          record={record}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function RecordDialogContent({ ledgerId, record, onOpenChange }: ContentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [kind, setKind] = useState<"debt" | "loan">(record?.kind ?? "debt");
  const [amount, setAmount] = useState(record?.amount ?? "");
  const [currencyId, setCurrencyId] = useState(record?.currency.id ?? "");
  const [loanDate, setLoanDate] = useState<Date | undefined>(
    record ? new Date(record.loanDate) : undefined,
  );
  const [note, setNote] = useState(record?.note ?? "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    record?.dueDate ? new Date(record.dueDate) : undefined,
  );
  const [interestRate, setInterestRate] = useState(record?.interestRate ?? "");
  const [penalty, setPenalty] = useState(record?.penalty ?? "");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    !!record?.dueDate || !!record?.interestRate || !!record?.penalty,
  );

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.record.allByLedger.queryKey({ ledgerId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.ledger.list.queryKey(),
      }),
    ]);
  };

  const createRecord = useMutation(
    trpc.record.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Record created successfully");
        await invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Failed to create record"),
    }),
  );

  const updateRecord = useMutation(
    trpc.record.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Record updated successfully");
        await invalidate();
        onOpenChange(false);
      },
      onError: () => toast.error("Failed to update record"),
    }),
  );

  const isPending = createRecord.isPending || updateRecord.isPending;
  const parsedAmount = parseFloat(amount);
  const isSubmitDisabled =
    isPending || !parsedAmount || parsedAmount <= 0 || !currencyId || !loanDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-bind so TS narrows the optional date to a concrete value.
    const submitLoanDate = loanDate;
    if (isSubmitDisabled || !submitLoanDate) return;

    const values = {
      amount,
      currencyId,
      note: note.trim() || null,
      loanDate: submitLoanDate,
      dueDate: dueDate ?? null,
      kind,
      interestRate: interestRate ? interestRate : null,
      penalty: penalty ? penalty : null,
    };

    if (record) {
      updateRecord.mutate({ id: record.id, ledgerId, ...values });
    } else {
      createRecord.mutate({ ledgerId, ...values });
    }
  };

  return (
    <>
      <DialogHeader className="border-b pb-4">
        <DialogTitle>{record ? "Edit Record" : "Add Record"}</DialogTitle>
      </DialogHeader>

      <form
        id="record-form"
        className="flex flex-col gap-6 py-4"
        onSubmit={handleSubmit}
      >
        {/* Record type toggle */}
        <ToggleGroup
          type="single"
          value={kind}
          onValueChange={(val) => {
            if (val) setKind(val as "debt" | "loan");
          }}
          variant="outline"
          className="w-full"
        >
          <ToggleGroupItem
            value="debt"
            className="flex-1 data-[state=on]:bg-red-400/25"
          >
            Borrow
            <BanknoteArrowDown />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="loan"
            className="flex-1 data-[state=on]:bg-green-400/25"
          >
            Lend
            <BanknoteArrowUp />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Amount + Currency */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Currency</Label>
            <CurrencyCombobox value={currencyId} onChange={setCurrencyId} />
          </div>
        </div>

        {/* Loan date */}
        <div className="flex flex-col gap-2">
          <Label>Loan date</Label>
          <DateField value={loanDate} onChange={setLoanDate} />
        </div>

        {/* Note */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            placeholder="Enter note (optional)"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Advanced fields */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="w-full justify-between"
            >
              Advanced Fields
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  isAdvancedOpen && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Due date</Label>
              <DateField value={dueDate} onChange={setDueDate} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="interest-rate">Interest rate (%)</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="penalty">Penalty</Label>
                <Input
                  id="penalty"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </form>

      <DialogFooter className="border-t pt-4">
        <Button
          variant="outline"
          className="min-w-24"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="record-form"
          disabled={isSubmitDisabled}
          className="min-w-32"
        >
          {isPending && <Spinner />}
          {record ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </>
  );
}
