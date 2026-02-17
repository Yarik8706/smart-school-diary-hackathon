import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const storeState = {
  weekLoad: {
    days: [
      { day: "Пн", load: 2 },
      { day: "Вт", load: 6 },
    ],
  },
  moodStats: { easy: 2, normal: 1, hard: 1 },
  warnings: [],
  error: null,
  isLoadingWeekLoad: false,
  isLoadingMoodStats: false,
  isLoadingWarnings: false,
  fetchWeekLoad: vi.fn().mockResolvedValue(undefined),
  fetchMoodStats: vi.fn().mockResolvedValue(undefined),
  fetchWarnings: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@/store/analytics", () => ({
  useAnalyticsStore: (selector: (state: typeof storeState) => unknown) =>
    selector(storeState),
}));

import { AnalyticsPageClient } from "@/components/analytics/analytics-page-client";

describe("AnalyticsPageClient", () => {
  it("fetches analytics data on mount", () => {
    render(<AnalyticsPageClient />);

    expect(storeState.fetchWeekLoad).toHaveBeenCalled();
    expect(storeState.fetchMoodStats).toHaveBeenCalled();
    expect(storeState.fetchWarnings).toHaveBeenCalled();
    expect(screen.getByText("Аналитика нагрузки")).toBeInTheDocument();
  });
});
