import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@ioyou/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ioyou/ui/dialog";
import { Field, FieldError } from "@ioyou/ui/field";
import { Input } from "@ioyou/ui/input";
import { Label } from "@ioyou/ui/label";
import { Spinner } from "@ioyou/ui/spinner";
import { Textarea } from "@ioyou/ui/textarea";

import { useTRPC } from "~/lib/trpc";

interface ContentProps {
  onOpenChange: (open: boolean) => void;
}

type Props = ContentProps & {
  open: boolean;
};

export function AddPersonDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AddPersonDialogContent onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function AddPersonDialogContent({ onOpenChange }: ContentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createPerson = useMutation(
    trpc.person.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Person created successfully");

        await queryClient.invalidateQueries({
          queryKey: trpc.person.all.queryKey(),
        });

        onOpenChange(false);
      },
      onError: () => {
        toast.error("Failed to create person");
      },
    }),
  );

  const isSubmitDisabled = createPerson.isPending || name.trim() === "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitDisabled) return;

    createPerson.mutate({
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Person</DialogTitle>
      </DialogHeader>

      <form
        id="add-person-form"
        className="flex flex-col gap-6 py-2"
        onSubmit={handleSubmit}
      >
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter description (optional)"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {createPerson.error && (
            <FieldError>{createPerson.error.message}</FieldError>
          )}
        </Field>
      </form>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-person-form"
          disabled={isSubmitDisabled}
        >
          {createPerson.isPending && <Spinner />}
          Add
        </Button>
      </DialogFooter>
    </>
  );
}
