import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedApi } = vi.hoisted(() => ({
  mockedApi: {
    get: vi.fn(),
  },
}));

vi.mock("@/lib/api-client", () => ({
  api: mockedApi,
  apiClient: mockedApi,
}));

import { useAnalyticsStore } from "@/store/analytics";

describe("useAnalyticsStore", () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    useAnalyticsStore.setState({
      weekLoad: null,
      moodStats: null,
      warnings: [],
      isLoadingWeekLoad: false,
      isLoadingMoodStats: false,
      isLoadingWarnings: false,
      error: null,
    });
  });

  it("fetches weekly load", async () => {
    mockedApi.get.mockResolvedValueOnce({
      days: [
        { day: 1, load_score: 3, lessons_count: 3, hard_subjects: [], warning: null },
        { day: 2, load_score: 7, lessons_count: 5, hard_subjects: ["Физика"], warning: "Высокая" },
      ],
    });

    await useAnalyticsStore.getState().fetchWeekLoad();

    expect(mockedApi.get).toHaveBeenCalledWith("/api/v1/analytics/load");
    expect(useAnalyticsStore.getState().weekLoad?.days).toHaveLength(2);
  });

  it("fetches mood stats and warnings", async () => {
    mockedApi.get
      .mockResolvedValueOnce({ easy_count: 5, normal_count: 2, hard_count: 1 })
      .mockResolvedValueOnce({ warnings: ["Среда: высокая нагрузка"] });

    await useAnalyticsStore.getState().fetchMoodStats();
    await useAnalyticsStore.getState().fetchWarnings();

    expect(useAnalyticsStore.getState().moodStats?.easy_count).toBe(5);
    expect(useAnalyticsStore.getState().warnings[0]).toContain("Среда");
  });

  it("sets localized error for failed requests", async () => {
    mockedApi.get.mockRejectedValue(new Error("network"));

    await useAnalyticsStore.getState().fetchWeekLoad();

    expect(useAnalyticsStore.getState().error).toBe(
      "Не удалось загрузить аналитику нагрузки.",
    );
  });
});
