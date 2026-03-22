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
import { usePersonStore } from "~/store/use-person-store";

interface ContentProps {
  onOpenChange: (open: boolean) => void;
  personId: string;
}

type Props = ContentProps & {
  open: boolean;
};

export function DeletePersonDialog({ open, onOpenChange, personId }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <DeletePersonDialogContent
          personId={personId}
          onOpenChange={onOpenChange}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeletePersonDialogContent({ personId, onOpenChange }: ContentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const resetPersonId = usePersonStore((s) => s.resetPersonId);
  const selectedPersonId = usePersonStore((s) => s.selectedPersonId);

  const deletePerson = useMutation(
    trpc.person.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Person deleted successfully");

        if (selectedPersonId === personId) resetPersonId();

        await queryClient.invalidateQueries({
          queryKey: trpc.person.all.queryKey(),
        });

        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to delete person");
      },
    }),
  );

  const handleDelete = () => {
    if (deletePerson.isPending) return;
    deletePerson.mutate({ id: personId });
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This person will be permanently deleted from your list. This action
          cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onOpenChange(false)}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={handleDelete}
          disabled={deletePerson.isPending}
        >
          {deletePerson.isPending && <Spinner />}
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
