import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarClock, EllipsisVertical, Trash2 } from "lucide-react";

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
import { DeleteRecordDialog } from "../delete-record-dialog";

interface RecordWithRelations {
  id: string;
  amount: string;
  kind: "loan" | "debt";
  loanDate: Date;
  dueDate: Date | null;
  note: string | null;
  personId: string;
  currency: { id: string; code: string };
  status: { id: string; code: string };
}

export function RecordCard({
  record,
  personId,
}: {
  record: RecordWithRelations;
  personId: string;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

      <DeleteRecordDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        personId={personId}
        recordId={record.id}
      />
    </>
  );
}
