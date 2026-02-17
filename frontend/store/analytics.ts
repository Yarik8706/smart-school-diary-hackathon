import { create } from "zustand";

import { apiClient } from "@/lib/api-client";
import type { MoodStats, WarningItem, WeekLoadAnalysis } from "@/types/analytics";

interface AnalyticsStore {
  weekLoad: WeekLoadAnalysis | null;
  moodStats: MoodStats | null;
  warnings: WarningItem[];
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
      const weekLoad = await apiClient.get<WeekLoadAnalysis>("/api/v1/analytics/load");
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
      const moodStats = await apiClient.get<MoodStats>("/api/v1/mood/stats");
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
      const warnings = await apiClient.get<WarningItem[]>("/api/v1/analytics/warnings");
      set({ warnings, error: null });
    } catch {
      set({ error: "Не удалось загрузить предупреждения." });
    } finally {
      set({ isLoadingWarnings: false });
    }
  },
}));

export type { AnalyticsStore };
