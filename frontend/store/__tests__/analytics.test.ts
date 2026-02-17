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
        { day: "Пн", load: 3 },
        { day: "Вт", load: 7 },
      ],
    });

    await useAnalyticsStore.getState().fetchWeekLoad();

    expect(mockedApi.get).toHaveBeenCalledWith("/api/v1/analytics/load");
    expect(useAnalyticsStore.getState().weekLoad?.days).toHaveLength(2);
  });

  it("fetches mood stats and warnings", async () => {
    mockedApi.get
      .mockResolvedValueOnce({ easy: 5, normal: 2, hard: 1 })
      .mockResolvedValueOnce([
        {
          id: "w1",
          day: "Среда",
          message: "Высокая нагрузка",
          recommendation: "Сделай перерыв",
        },
      ]);

    await useAnalyticsStore.getState().fetchMoodStats();
    await useAnalyticsStore.getState().fetchWarnings();

    expect(useAnalyticsStore.getState().moodStats?.easy).toBe(5);
    expect(useAnalyticsStore.getState().warnings[0]?.day).toBe("Среда");
  });

  it("sets localized error for failed requests", async () => {
    mockedApi.get.mockRejectedValue(new Error("network"));

    await useAnalyticsStore.getState().fetchWeekLoad();

    expect(useAnalyticsStore.getState().error).toBe(
      "Не удалось загрузить аналитику нагрузки.",
    );
  });
});
