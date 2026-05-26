import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ioyou/ui/alert-dialog";
import { Spinner } from "@ioyou/ui/spinner";

import { useTRPC } from "~/lib/trpc";
import { useLedgerStore } from "~/store/use-ledger-store";

interface ContentProps {
  onOpenChange: (open: boolean) => void;
  ledgerId: string;
}

interface Props extends ContentProps {
  open: boolean;
}

export function DeleteLedgerDialog({ open, onOpenChange, ledgerId }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <DeleteLedgerDialogContent
          ledgerId={ledgerId}
          onOpenChange={onOpenChange}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteLedgerDialogContent({ ledgerId, onOpenChange }: ContentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const resetLedgerId = useLedgerStore((s) => s.resetLedgerId);
  const selectedLedgerId = useLedgerStore((s) => s.selectedLedgerId);

  const deleteLedger = useMutation(
    trpc.ledger.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Ledger deleted successfully");

        if (selectedLedgerId === ledgerId) resetLedgerId();

        await queryClient.invalidateQueries({
          queryKey: trpc.ledger.list.queryKey(),
        });

        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to delete ledger");
      },
    }),
  );

  const handleDelete = () => {
    if (deleteLedger.isPending) return;
    deleteLedger.mutate({ id: ledgerId });
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This ledger and all of its records will be permanently deleted. This
          action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onOpenChange(false)}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteLedger.isPending}
        >
          {deleteLedger.isPending && <Spinner />}
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
