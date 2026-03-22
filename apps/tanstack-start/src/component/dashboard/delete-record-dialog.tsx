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
  personId: string;
  recordId: string;
  onOpenChange: (open: boolean) => void;
}

interface Props extends ContentProps {
  open: boolean;
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  personId,
  recordId,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <DeleteRecordDialogContent
          onOpenChange={onOpenChange}
          personId={personId}
          recordId={recordId}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteRecordDialogContent({
  onOpenChange,
  personId,
  recordId,
}: ContentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteRecord = useMutation(
    trpc.record.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Record deleted successfully");

        await queryClient.invalidateQueries({
          queryKey: trpc.record.allByPerson.queryKey({ personId }),
        });

        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to delete record");
      },
    }),
  );

  const handleDelete = () => {
    if (deleteRecord.isPending) return;
    deleteRecord.mutate({ id: recordId, personId });
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
