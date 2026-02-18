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

import { useMaterialStore } from "@/store/materials";

describe("useMaterialStore", () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    useMaterialStore.setState({
      materials: [],
      recommendation: "",
      loading: false,
      error: null,
    });
  });

  it("searches materials by query and optional subject", async () => {
    mockedApi.get.mockResolvedValueOnce({
      materials: [
        {
          title: "Линейные уравнения",
          source: "youtube",
          url: "https://youtu.be/abc",
          thumbnail_url: "https://img.youtube.com/vi/abc/default.jpg",
          description: "Пошаговое объяснение",
        },
      ],
      recommendation: "Сначала теория, потом задачи",
    });

    await useMaterialStore.getState().searchMaterials("линейные", "math");

    expect(mockedApi.get).toHaveBeenCalledWith(
      "/api/v1/materials/search?query=%D0%BB%D0%B8%D0%BD%D0%B5%D0%B9%D0%BD%D1%8B%D0%B5&subject_id=math",
    );
    expect(useMaterialStore.getState().materials).toHaveLength(1);
    expect(useMaterialStore.getState().recommendation).toBe("Сначала теория, потом задачи");
    expect(useMaterialStore.getState().loading).toBe(false);
  });

  it("loads homework materials by homework id", async () => {
    mockedApi.get.mockResolvedValueOnce({
      materials: [
        {
          title: "Конспект по теме",
          source: "article",
          url: "https://example.com/article",
        },
      ],
      recommendation: "Повтори формулы",
    });

    await useMaterialStore.getState().fetchHomeworkMaterials("h1");

    expect(mockedApi.get).toHaveBeenCalledWith("/api/v1/homework/h1/materials");
    expect(useMaterialStore.getState().materials[0]?.title).toBe("Конспект по теме");
    expect(useMaterialStore.getState().recommendation).toBe("Повтори формулы");
  });

  it("sets localized error when api call fails", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("boom"));

    await useMaterialStore.getState().searchMaterials("ошибка");

    expect(useMaterialStore.getState().error).toBe(
      "Не удалось загрузить материалы.",
    );
    expect(useMaterialStore.getState().loading).toBe(false);
  });
});
