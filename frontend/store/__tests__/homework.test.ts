import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedApi } = vi.hoisted(() => ({
  mockedApi: {
    get: vi.fn(),
    post: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: mockedApi,
}));

import { useHomeworkStore } from "@/store/homework";

describe("useHomeworkStore", () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.request.mockReset();
    useHomeworkStore.setState({
      homework: [],
      subjects: [],
      isLoading: false,
      error: null,
    });
  });

  it("fetches homework and subjects", async () => {
    mockedApi.get
      .mockResolvedValueOnce([
        { id: "h1", title: "Алгебра", deadline: "2099-01-01" },
      ])
      .mockResolvedValueOnce([
        { id: "s1", name: "Математика", color: "bg-blue-500" },
      ]);

    await useHomeworkStore.getState().fetchHomework();
    await useHomeworkStore.getState().fetchSubjects();

    expect(useHomeworkStore.getState().homework).toHaveLength(1);
    expect(useHomeworkStore.getState().subjects).toHaveLength(1);
  });

  it("sends CRUD, complete and mood requests", async () => {
    mockedApi.post.mockResolvedValue({});
    mockedApi.request.mockResolvedValue({});
    mockedApi.get.mockResolvedValue([]);

    await useHomeworkStore.getState().addHomework({
      title: "Геометрия",
      subject_id: "s1",
      deadline: "2099-02-01",
    });
    await useHomeworkStore
      .getState()
      .updateHomework("h1", { title: "Геометрия обновлено" });
    await useHomeworkStore.getState().toggleComplete("h1");
    await useHomeworkStore.getState().submitMood("h1", "hard", "сложно");
    await useHomeworkStore.getState().deleteHomework("h1");

    expect(mockedApi.post).toHaveBeenCalledWith("/api/v1/homework", {
      title: "Геометрия",
      subject_id: "s1",
      deadline: "2099-02-01",
    });
    expect(mockedApi.request).toHaveBeenCalledWith("/api/v1/homework/h1", {
      method: "PUT",
      body: { title: "Геометрия обновлено" },
    });
    expect(mockedApi.request).toHaveBeenCalledWith(
      "/api/v1/homework/h1/complete",
      { method: "PATCH" },
    );
    expect(mockedApi.post).toHaveBeenCalledWith("/api/v1/mood", {
      homework_id: "h1",
      mood: "hard",
      note: "сложно",
    });
    expect(mockedApi.request).toHaveBeenCalledWith("/api/v1/homework/h1", {
      method: "DELETE",
    });
  });

  it("applies localized error if homework fetch fails", async () => {
    mockedApi.get.mockRejectedValue(new Error("boom"));

    await useHomeworkStore.getState().fetchHomework();

    expect(useHomeworkStore.getState().error).toBe(
      "Не удалось загрузить домашние задания.",
    );
  });
});
