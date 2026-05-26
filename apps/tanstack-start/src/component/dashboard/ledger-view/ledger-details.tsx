import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

import type { BalanceRecord } from "@ioyou/api/balance";
import { computeLedgerBalance } from "@ioyou/api/balance";
import { Avatar, AvatarFallback } from "@ioyou/ui/avatar";
import { Button } from "@ioyou/ui/button";
import { Card, CardHeader } from "@ioyou/ui/card";
import { Separator } from "@ioyou/ui/separator";
import { Skeleton } from "@ioyou/ui/skeleton";

import { authClient } from "~/auth/client";
import { useTRPC } from "~/lib/trpc";
import { RecordDialog } from "../add-record/record-dialog";
import { DeleteLedgerDialog } from "../delete-ledger-dialog";
import { BalanceCard } from "./balance-card";
import { RecordCard } from "./record-card";
import { RecordsEmpty } from "./records-empty";

export function LedgerDetails({ ledgerId }: { ledgerId: string }) {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const viewerId = session?.user.id ?? "";

  const { data: ledger, isLoading: isLedgerLoading } = useQuery(
    trpc.ledger.byId.queryOptions({ id: ledgerId }),
  );

  const { data: records, isLoading: isRecordsLoading } = useQuery(
    trpc.record.allByLedger.queryOptions({ ledgerId }),
  );

  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isDeleteLedgerOpen, setIsDeleteLedgerOpen] = useState(false);

  const name = ledger?.name ?? "Untitled";

  const balance = useMemo(() => {
    if (!records) return [];
    const balanceRecords: BalanceRecord[] = records.map((r) => ({
      id: r.id,
      amount: r.amount,
      kind: r.kind,
      createdBy: r.createdBy,
      confirmationStatus: r.confirmationStatus,
      currencyCode: r.currency.code,
    }));
    return computeLedgerBalance(balanceRecords, viewerId).byCurrency;
  }, [records, viewerId]);

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
      {/* Ledger header */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {isLedgerLoading || !ledger ? (
            <Skeleton className="size-16 rounded-full" />
          ) : (
            <Avatar size="lg" className="size-16">
              <AvatarFallback className="text-2xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {isLedgerLoading || !ledger ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <h2 className="text-2xl font-semibold">{name}</h2>
          )}
        </div>
        {!isLedgerLoading && ledger && (
          <Button
            variant="ghost"
            size="icon"
            className="self-start"
            onClick={() => setIsDeleteLedgerOpen(true)}
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
          {/* Net balance per currency */}
          {balance.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {balance.map((b) => (
                <BalanceCard
                  key={b.currencyCode}
                  balance={b}
                  counterpartyName={name}
                />
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
                    ledgerId={ledgerId}
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
                    ledgerId={ledgerId}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <RecordDialog
        open={isAddRecordOpen}
        onOpenChange={setIsAddRecordOpen}
        ledgerId={ledgerId}
      />

      <DeleteLedgerDialog
        open={isDeleteLedgerOpen}
        onOpenChange={setIsDeleteLedgerOpen}
        ledgerId={ledgerId}
      />
    </div>
  );
}
