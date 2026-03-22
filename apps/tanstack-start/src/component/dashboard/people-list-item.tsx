import { useState } from "react";
import { EllipsisVertical, Trash2 } from "lucide-react";

import { cn } from "@ioyou/ui";
import { Avatar, AvatarFallback } from "@ioyou/ui/avatar";
import { Button } from "@ioyou/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ioyou/ui/dropdown-menu";
import { Skeleton } from "@ioyou/ui/skeleton";

import { usePersonStore } from "~/store/use-person-store";
import { DeletePersonDialog } from "./delete-person-dialog";

interface Person {
  id: string;
  name: string;
  description: string | null;
}

export function PeopleListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg p-3">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3.5 w-40" />
      </div>
    </div>
  );
}

export function PeopleListItem({ person }: { person: Person }) {
  const selectedPersonId = usePersonStore((s) => s.selectedPersonId);
  const togglePersonId = usePersonStore((s) => s.togglePersonId);
  const isSelected = selectedPersonId === person.id;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "hover:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all",
          isSelected &&
            "bg-primary/5 ring-primary/25 shadow-primary/12 shadow-lg ring-2",
        )}
        onClick={() => togglePersonId(person.id)}
      >
        <Avatar>
          <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-medium">{person.name}</span>
          {person.description && (
            <span className="text-muted-foreground truncate text-xs">
              {person.description}
            </span>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DeletePersonDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        personId={person.id}
      />
    </>
  );
}
