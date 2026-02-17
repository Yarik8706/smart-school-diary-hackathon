import { create } from "zustand";

import { apiClient } from "@/lib/api-client";
import type {
  Homework,
  Reminder,
  ReminderCreate,
  ReminderUpdate,
} from "@/types/reminders";

export interface ReminderStore {
  reminders: Reminder[];
  homework: Homework[];
  isLoading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  fetchHomework: () => Promise<void>;
  addReminder: (reminder: ReminderCreate) => Promise<void>;
  updateReminder: (id: string, reminder: ReminderUpdate) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const reminderPath = "/api/v1/reminders";
const homeworkPath = "/api/v1/homework";

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],
  homework: [],
  isLoading: false,
  error: null,
  fetchReminders: async () => {
    set({ isLoading: true });
    try {
      const reminders = await apiClient.get<Reminder[]>(reminderPath);
      set({ reminders, error: null });
    } catch {
      set({ error: "Не удалось загрузить напоминания." });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchHomework: async () => {
    try {
      const homework = await apiClient.get<Homework[]>(homeworkPath);
      set({ homework, error: null });
    } catch {
      set({ error: "Не удалось загрузить домашние задания." });
    }
  },
  addReminder: async (reminder) => {
    await apiClient.post<Reminder>(reminderPath, reminder);
    await get().fetchReminders();
  },
  updateReminder: async (id, reminder) => {
    await apiClient.request<Reminder>(`${reminderPath}/${id}`, {
      method: "PUT",
      body: reminder,
    });
    await get().fetchReminders();
  },
  deleteReminder: async (id) => {
    await apiClient.request<void>(`${reminderPath}/${id}`, {
      method: "DELETE",
    });
    await get().fetchReminders();
  },
}));
