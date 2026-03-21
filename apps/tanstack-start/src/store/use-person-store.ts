import { create } from "zustand";

interface PersonStore {
  selectedPersonId: string | null;
  setPersonId: (id: string | null) => void;
  togglePersonId: (id: string) => void;
  resetPersonId: () => void;
}

export const usePersonStore = create<PersonStore>((set, get) => ({
  selectedPersonId: null,
  setPersonId: (id) => set({ selectedPersonId: id }),
  togglePersonId: (id) =>
    set({ selectedPersonId: get().selectedPersonId === id ? null : id }),
  resetPersonId: () => set({ selectedPersonId: null }),
}));
