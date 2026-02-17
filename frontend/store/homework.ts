import { create } from "zustand";

import { apiClient } from "@/lib/api-client";
import type {
  Homework,
  HomeworkCreate,
  HomeworkFiltersState,
  HomeworkUpdate,
  MoodLevel,
  Subject,
} from "@/types/homework";

export interface HomeworkStore {
  homework: Homework[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  fetchHomework: (filters?: HomeworkFiltersState) => Promise<void>;
  fetchSubjects: () => Promise<void>;
  addHomework: (hw: HomeworkCreate) => Promise<void>;
  updateHomework: (id: string, hw: HomeworkUpdate) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  submitMood: (
    homeworkId: string,
    mood: MoodLevel,
    note?: string,
  ) => Promise<void>;
}

const homeworkPath = "/api/v1/homework";
const subjectsPath = "/api/v1/subjects";

const makeQuery = (filters?: HomeworkFiltersState) => {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.subject !== "all") params.set("subject", filters.subject);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.deadline !== "all") params.set("deadline", filters.deadline);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const useHomeworkStore = create<HomeworkStore>((set, get) => ({
  homework: [],
  subjects: [],
  isLoading: false,
  error: null,
  fetchHomework: async (filters) => {
    set({ isLoading: true });
    try {
      const homework = await apiClient.get<Homework[]>(
        `${homeworkPath}${makeQuery(filters)}`,
      );
      set({ homework, error: null });
    } catch {
      set({ error: "Не удалось загрузить домашние задания." });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSubjects: async () => {
    try {
      const subjects = await apiClient.get<Subject[]>(subjectsPath);
      set({ subjects, error: null });
    } catch {
      set({ error: "Не удалось загрузить предметы." });
    }
  },
  addHomework: async (hw) => {
    await apiClient.post<Homework>(homeworkPath, hw);
    await get().fetchHomework();
  },
  updateHomework: async (id, hw) => {
    await apiClient.request<Homework>(`${homeworkPath}/${id}`, {
      method: "PUT",
      body: hw,
    });
    await get().fetchHomework();
  },
  deleteHomework: async (id) => {
    await apiClient.request<void>(`${homeworkPath}/${id}`, {
      method: "DELETE",
    });
    await get().fetchHomework();
  },
  toggleComplete: async (id) => {
    await apiClient.request<void>(`${homeworkPath}/${id}/complete`, {
      method: "PATCH",
    });
    await get().fetchHomework();
  },
  submitMood: async (homeworkId, mood, note) => {
    await apiClient.post("/api/v1/mood", {
      homework_id: homeworkId,
      mood,
      note,
    });
  },
}));
