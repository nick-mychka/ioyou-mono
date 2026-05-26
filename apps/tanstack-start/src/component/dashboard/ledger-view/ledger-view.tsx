import { useLedgerStore } from "~/store/use-ledger-store";
import { LedgerDetails } from "./ledger-details";
import { LedgerUnselected } from "./ledger-unselected";

export function LedgerView() {
  const selectedLedgerId = useLedgerStore((s) => s.selectedLedgerId);

  return (
    <section className="flex flex-col overflow-y-auto pt-3 pr-6 pb-6 pl-2">
      {selectedLedgerId ? (
        <LedgerDetails key={selectedLedgerId} ledgerId={selectedLedgerId} />
      ) : (
        <LedgerUnselected />
      )}
    </section>
  );
}
