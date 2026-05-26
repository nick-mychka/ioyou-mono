import { create } from "zustand";

interface LedgerStore {
  selectedLedgerId: string | null;
  setLedgerId: (id: string | null) => void;
  toggleLedgerId: (id: string) => void;
  resetLedgerId: () => void;
}

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  selectedLedgerId: null,
  setLedgerId: (id) => set({ selectedLedgerId: id }),
  toggleLedgerId: (id) =>
    set({ selectedLedgerId: get().selectedLedgerId === id ? null : id }),
  resetLedgerId: () => set({ selectedLedgerId: null }),
}));
