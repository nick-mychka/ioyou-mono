import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarClock, EllipsisVertical, Pencil, Trash2 } from "lucide-react";

import type { RouterOutputs } from "@ioyou/api";
import { cn } from "@ioyou/ui";
import { Button } from "@ioyou/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@ioyou/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ioyou/ui/dropdown-menu";

import { formatAmount } from "~/lib/format";
import { RecordDialog } from "../add-record/record-dialog";
import { DeleteRecordDialog } from "../delete-record-dialog";

type LedgerRecord = RouterOutputs["record"]["allByLedger"][number];

export function RecordCard({
  record,
  ledgerId,
}: {
  record: LedgerRecord;
  ledgerId: string;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOverdue =
    record.dueDate && isBefore(record.dueDate, startOfDay(new Date()));

  return (
    <>
      <Card
        className={cn(
          "gap-0 overflow-hidden border-l-4 py-0",
          record.kind === "debt" ? "border-l-red-400" : "border-l-green-400",
        )}
      >
        <CardHeader className="py-4">
          <CardTitle className="flex items-baseline gap-1">
            <span className="text-lg">
              {formatAmount(Number(record.amount))}
            </span>
            <span className="text-muted-foreground text-sm">
              {record.currency.code}
            </span>
          </CardTitle>
          <CardDescription className="text-foreground/60">
            {format(record.loanDate, "MMM dd, yyyy")}
          </CardDescription>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <EllipsisVertical className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
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
        </CardHeader>
        {record.dueDate && (
          <div
            className={cn(
              "flex items-center gap-1 px-6 pb-3 text-xs",
              isOverdue
                ? "font-medium text-orange-500"
                : "text-muted-foreground",
            )}
          >
            <CalendarClock className="size-3 shrink-0" />
            <span>
              {isOverdue ? "Overdue" : "Due"}{" "}
              {format(record.dueDate, "MMM dd, yyyy")}
            </span>
          </div>
        )}
      </Card>

      <RecordDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        ledgerId={ledgerId}
        record={record}
      />

      <DeleteRecordDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        ledgerId={ledgerId}
        recordId={record.id}
      />
    </>
  );
}
