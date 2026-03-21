import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BanknoteArrowDown, BanknoteArrowUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

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

export function AddRecordDialog({
  open,
  onOpenChange,
  personId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [kind, setKind] = useState<"debt" | "loan">("debt");
  const [amount, setAmount] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [loanDate, setLoanDate] = useState<Date | undefined>();
  const [note, setNote] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [interestRate, setInterestRate] = useState("");
  const [penalty, setPenalty] = useState("");

  const createRecord = useMutation(
    trpc.record.create.mutationOptions({
      onSuccess: () => {
        toast.success("Record created successfully");
        void queryClient.invalidateQueries({
          queryKey: trpc.record.allByPerson.queryKey({ personId }),
        });
        onOpenChange(false);
        resetForm();
      },
      onError: () => {
        toast.error("Failed to create record");
      },
    }),
  );

  const resetForm = () => {
    setKind("debt");
    setAmount("");
    setCurrencyId("");
    setLoanDate(undefined);
    setNote("");
    setIsAdvancedOpen(false);
    setDueDate(undefined);
    setInterestRate("");
    setPenalty("");
  };

  const parsedAmount = parseFloat(amount);
  const isSubmitDisabled =
    createRecord.isPending ||
    !parsedAmount ||
    parsedAmount <= 0 ||
    !currencyId ||
    !loanDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    createRecord.mutate({
      personId,
      amount: amount,
      currencyId,
      note: note.trim() || null,
      loanDate,
      dueDate: dueDate ?? null,
      kind,
      interestRate: interestRate ? interestRate : null,
      penalty: penalty ? penalty : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Add Record</DialogTitle>
        </DialogHeader>

        <form
          id="add-record-form"
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
              <BanknoteArrowDown className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="loan"
              className="flex-1 data-[state=on]:bg-green-400/25"
            >
              Lend
              <BanknoteArrowUp className="size-4" />
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
            form="add-record-form"
            disabled={isSubmitDisabled}
            className="min-w-32"
          >
            {createRecord.isPending && <Spinner className="size-4" />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
