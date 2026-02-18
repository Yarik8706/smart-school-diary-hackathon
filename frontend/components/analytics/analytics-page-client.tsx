"use client";

import { useEffect } from "react";

import { MoodStatsCard } from "@/components/analytics/mood-stats-card";
import { WarningsList } from "@/components/analytics/warnings-list";
import { WeekLoadChart } from "@/components/analytics/week-load-chart";
import { useAnalyticsStore } from "@/store/analytics";

export function AnalyticsPageClient() {
  const weekLoad = useAnalyticsStore((state) => state.weekLoad);
  const moodStats = useAnalyticsStore((state) => state.moodStats);
  const warnings = useAnalyticsStore((state) => state.warnings);
  const error = useAnalyticsStore((state) => state.error);
  const isLoadingWeekLoad = useAnalyticsStore((state) => state.isLoadingWeekLoad);
  const isLoadingMoodStats = useAnalyticsStore((state) => state.isLoadingMoodStats);
  const isLoadingWarnings = useAnalyticsStore((state) => state.isLoadingWarnings);
  const fetchWeekLoad = useAnalyticsStore((state) => state.fetchWeekLoad);
  const fetchMoodStats = useAnalyticsStore((state) => state.fetchMoodStats);
  const fetchWarnings = useAnalyticsStore((state) => state.fetchWarnings);

  useEffect(() => {
    void Promise.all([fetchWeekLoad(), fetchMoodStats(), fetchWarnings()]);
  }, [fetchMoodStats, fetchWarnings, fetchWeekLoad]);

  const isLoading = isLoadingWeekLoad || isLoadingMoodStats || isLoadingWarnings;

  return (
    <section className="space-y-4" aria-live="polite">
      <div>
        <h2 className="text-3xl font-black hidden md:block">Аналитика нагрузки</h2>
        <p className="text-muted-foreground text-sm">
          Следи за балансом учебной нагрузки и эмоционального состояния за неделю.
        </p>
      </div>
      {error ? (
        <p className="border-destructive/40 text-destructive rounded-md border p-3 text-sm">
          {error}
        </p>
      ) : null}
      {isLoading ? <p className="text-muted-foreground text-sm">Загрузка...</p> : null}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <WeekLoadChart days={weekLoad?.days ?? []} />
        <MoodStatsCard stats={moodStats} />
      </div>
      <WarningsList warnings={warnings} />
    </section>
  );
}

export default AnalyticsPageClient;
