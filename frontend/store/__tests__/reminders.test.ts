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

import { useReminderStore } from "@/store/reminders";

describe("useReminderStore", () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedApi.request.mockReset();
    useReminderStore.setState({
      reminders: [],
      homework: [],
      isLoading: false,
      error: null,
    });
  });

  it("fetches reminders and homework", async () => {
    mockedApi.get
      .mockResolvedValueOnce([
        {
          id: "1",
          homework_id: "h1",
          remind_at: "2026-01-01",
          status: "pending",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "h1",
          title: "Алгебра",
          subject: "Математика",
          subject_color: "bg-blue-500",
        },
      ]);

    await useReminderStore.getState().fetchReminders();
    await useReminderStore.getState().fetchHomework();

    expect(useReminderStore.getState().reminders).toHaveLength(1);
    expect(useReminderStore.getState().homework).toHaveLength(1);
  });

  it("creates, updates, deletes reminder via api", async () => {
    mockedApi.post.mockResolvedValue({});
    mockedApi.request.mockResolvedValue({});
    mockedApi.get.mockResolvedValue([]);

    await useReminderStore
      .getState()
      .addReminder({ homework_id: "h1", remind_at: "2026-01-01" });
    await useReminderStore
      .getState()
      .updateReminder("1", { remind_at: "2026-01-02" });
    await useReminderStore.getState().deleteReminder("1");

    expect(mockedApi.post).toHaveBeenCalledWith("/api/v1/reminders", {
      homework_id: "h1",
      remind_at: "2026-01-01",
    });
    expect(mockedApi.request).toHaveBeenCalledWith("/api/v1/reminders/1", {
      method: "PUT",
      body: { remind_at: "2026-01-02" },
    });
    expect(mockedApi.request).toHaveBeenCalledWith("/api/v1/reminders/1", {
      method: "DELETE",
    });
  });

  it("sets localized error on fetch failure", async () => {
    mockedApi.get.mockRejectedValue(new Error("fail"));

    await useReminderStore.getState().fetchReminders();

    expect(useReminderStore.getState().error).toBe(
      "Не удалось загрузить напоминания.",
    );
  });
});
