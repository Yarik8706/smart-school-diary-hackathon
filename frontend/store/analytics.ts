import { create } from "zustand";

import { api } from "@/lib/api-client";
import type { MoodStats, WarningsResponse, WeekLoadAnalysis } from "@/types/analytics";

interface AnalyticsStore {
  weekLoad: WeekLoadAnalysis | null;
  moodStats: MoodStats | null;
  warnings: string[];
  isLoadingWeekLoad: boolean;
  isLoadingMoodStats: boolean;
  isLoadingWarnings: boolean;
  error: string | null;
  fetchWeekLoad: () => Promise<void>;
  fetchMoodStats: () => Promise<void>;
  fetchWarnings: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  weekLoad: null,
  moodStats: null,
  warnings: [],
  isLoadingWeekLoad: false,
  isLoadingMoodStats: false,
  isLoadingWarnings: false,
  error: null,
  fetchWeekLoad: async () => {
    set({ isLoadingWeekLoad: true });
    try {
      const weekLoad = await api.get<WeekLoadAnalysis>("/api/v1/analytics/load");
      set({ weekLoad, error: null });
    } catch {
      set({ error: "Не удалось загрузить аналитику нагрузки." });
    } finally {
      set({ isLoadingWeekLoad: false });
    }
  },
  fetchMoodStats: async () => {
    set({ isLoadingMoodStats: true });
    try {
      const moodStats = await api.get<MoodStats>("/api/v1/mood/stats");
      set({ moodStats, error: null });
    } catch {
      set({ error: "Не удалось загрузить статистику настроения." });
    } finally {
      set({ isLoadingMoodStats: false });
    }
  },
  fetchWarnings: async () => {
    set({ isLoadingWarnings: true });
    try {
      const warnings = await api.get<WarningsResponse>("/api/v1/analytics/warnings");
      set({ warnings: warnings.warnings, error: null });
    } catch {
      set({ error: "Не удалось загрузить предупреждения." });
    } finally {
      set({ isLoadingWarnings: false });
    }
  },
}));

export type { AnalyticsStore };
