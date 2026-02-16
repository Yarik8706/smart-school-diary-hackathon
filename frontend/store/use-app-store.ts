import { create } from "zustand";

interface AppState {
  isReady: boolean;
  setIsReady: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  setIsReady: (value) => set({ isReady: value }),
}));
