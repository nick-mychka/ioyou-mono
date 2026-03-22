import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@ioyou/ui/avatar";
import { Button } from "@ioyou/ui/button";
import { Card, CardHeader } from "@ioyou/ui/card";
import { Separator } from "@ioyou/ui/separator";
import { Skeleton } from "@ioyou/ui/skeleton";

import { useTRPC } from "~/lib/trpc";
import { AddRecordDialog } from "./add-record/add-record-dialog";
import { DeletePersonDialog } from "./delete-person-dialog";
import { RecordCard } from "./person-view/record-card";
import { RecordTotalCard } from "./person-view/record-total-card";
import { RecordsEmpty } from "./person-view/records-empty";

export function PersonDetails({ personId }: { personId: string }) {
  const trpc = useTRPC();

  const { data: person, isLoading: isPersonLoading } = useQuery(
    trpc.person.byId.queryOptions({ id: personId }),
  );

  const { data: records, isLoading: isRecordsLoading } = useQuery(
    trpc.record.allByPerson.queryOptions({ personId }),
  );

  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isDeletePersonOpen, setIsDeletePersonOpen] = useState(false);

  const totals = useMemo(() => {
    if (!records || records.length === 0) return [];

    const grouped = new Map<
      string,
      { kind: "loan" | "debt"; currencyCode: string; total: number }
    >();

    for (const record of records) {
      const key = `${record.kind}-${record.currency.id}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.total += Number(record.amount);
      } else {
        grouped.set(key, {
          kind: record.kind,
          currencyCode: record.currency.code,
          total: Number(record.amount),
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.kind.localeCompare(b.kind),
    );
  }, [records]);

  const lendRecords = useMemo(
    () => records?.filter((r) => r.kind === "loan") ?? [],
    [records],
  );

  const borrowRecords = useMemo(
    () => records?.filter((r) => r.kind === "debt") ?? [],
    [records],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Person header */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {isPersonLoading || !person ? (
            <Skeleton className="size-16 rounded-full" />
          ) : (
            <Avatar size="lg" className="size-16">
              <AvatarFallback className="text-2xl">
                {person.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {isPersonLoading || !person ? (
            <>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">{person.name}</h2>
              {person.description && (
                <p className="text-muted-foreground text-sm">
                  {person.description}
                </p>
              )}
            </>
          )}
        </div>
        {!isPersonLoading && person && (
          <Button
            variant="ghost"
            size="icon"
            className="self-start"
            onClick={() => setIsDeletePersonOpen(true)}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      <Separator />

      {/* Records loading state */}
      {isRecordsLoading && (
        <>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 2 }, (_, i) => (
              <Card
                key={i}
                className="min-w-44 grow-0 basis-44 gap-0 overflow-hidden border-b-4 py-0"
              >
                <CardHeader className="py-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i} className="gap-0 overflow-hidden border-l-4 py-0">
                <CardHeader className="py-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Records empty state */}
      {!isRecordsLoading && records?.length === 0 && (
        <RecordsEmpty onAddRecord={() => setIsAddRecordOpen(true)} />
      )}

      {/* Records content */}
      {!isRecordsLoading && records && records.length > 0 && (
        <>
          {/* Totals */}
          {totals.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {totals.map((total, i) => (
                <RecordTotalCard key={i} total={total} />
              ))}
            </div>
          )}

          {/* Records header */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Records ({records.length})
            </span>
            <Button size="sm" onClick={() => setIsAddRecordOpen(true)}>
              <Plus />
              Add Record
            </Button>
          </div>

          {/* Lend records */}
          {lendRecords.length > 0 && (
            <>
              <span className="text-xs text-green-500">
                Lend ({lendRecords.length})
              </span>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                {lendRecords.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    personId={personId}
                  />
                ))}
              </div>
            </>
          )}

          {/* Borrow records */}
          {borrowRecords.length > 0 && (
            <>
              <span className="text-xs text-red-500">
                Borrow ({borrowRecords.length})
              </span>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                {borrowRecords.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    personId={personId}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {person && (
        <AddRecordDialog
          open={isAddRecordOpen}
          onOpenChange={setIsAddRecordOpen}
          personId={personId}
        />
      )}

      <DeletePersonDialog
        open={isDeletePersonOpen}
        onOpenChange={setIsDeletePersonOpen}
        personId={personId}
      />
    </div>
  );
}
