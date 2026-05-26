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

interface ContentProps {
  ledgerId: string;
  recordId: string;
  onOpenChange: (open: boolean) => void;
}

interface Props extends ContentProps {
  open: boolean;
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  ledgerId,
  recordId,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <DeleteRecordDialogContent
          onOpenChange={onOpenChange}
          ledgerId={ledgerId}
          recordId={recordId}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteRecordDialogContent({
  onOpenChange,
  ledgerId,
  recordId,
}: ContentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteRecord = useMutation(
    trpc.record.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Record deleted successfully");

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.record.allByLedger.queryKey({ ledgerId }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.ledger.list.queryKey(),
          }),
        ]);

        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to delete record");
      },
    }),
  );

  const handleDelete = () => {
    if (deleteRecord.isPending) return;
    deleteRecord.mutate({ id: recordId });
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This record will be permanently deleted. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onOpenChange(false)}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteRecord.isPending}
        >
          {deleteRecord.isPending && <Spinner />}
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
