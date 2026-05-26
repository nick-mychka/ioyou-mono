import { useState } from "react";
import { EllipsisVertical, Trash2 } from "lucide-react";

import type { RouterOutputs } from "@ioyou/api";
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

import { toBalanceLines } from "~/lib/balance";
import { useLedgerStore } from "~/store/use-ledger-store";
import { DeleteLedgerDialog } from "../delete-ledger-dialog";

type Ledger = RouterOutputs["ledger"]["list"][number];

export function LedgerListItemSkeleton() {
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

export function LedgerListItem({ ledger }: { ledger: Ledger }) {
  const selectedLedgerId = useLedgerStore((s) => s.selectedLedgerId);
  const toggleLedgerId = useLedgerStore((s) => s.toggleLedgerId);
  const isSelected = selectedLedgerId === ledger.id;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const name = ledger.name ?? "Untitled";
  const lines = toBalanceLines(ledger.balance, name).filter(
    (l) => l.tone !== "settled",
  );

  return (
    <>
      <div
        className={cn(
          "hover:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all",
          isSelected &&
            "bg-primary/5 ring-primary/25 shadow-primary/12 shadow-lg ring-2",
        )}
        onClick={() => toggleLedgerId(ledger.id)}
      >
        <Avatar>
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-medium">{name}</span>
          {lines.length > 0 ? (
            <span className="text-muted-foreground truncate text-xs">
              {lines.map((l) => l.text).join(" · ")}
            </span>
          ) : (
            <span className="text-muted-foreground truncate text-xs">
              Settled
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

      <DeleteLedgerDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        ledgerId={ledger.id}
      />
    </>
  );
}
