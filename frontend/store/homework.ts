import { create } from "zustand";

import { api } from "@/lib/api-client";
import type {
  GenerateStepsResponse,
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
  isGeneratingByHomeworkId: Record<string, boolean>;
  error: string | null;
  fetchHomework: (filters?: HomeworkFiltersState) => Promise<void>;
  fetchSubjects: () => Promise<void>;
  addHomework: (hw: HomeworkCreate) => Promise<void>;
  updateHomework: (id: string, hw: HomeworkUpdate) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  generateSteps: (homeworkId: string) => Promise<void>;
  toggleStep: (stepId: string) => Promise<void>;
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
  isGeneratingByHomeworkId: {},
  error: null,
  fetchHomework: async (filters) => {
    set({ isLoading: true });
    try {
      const homework = await api.get<Homework[]>(
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
      const subjects = await api.get<Subject[]>(subjectsPath);
      set({ subjects, error: null });
    } catch {
      set({ error: "Не удалось загрузить предметы." });
    }
  },
  addHomework: async (hw) => {
    await api.post<Homework>(homeworkPath, hw);
    await get().fetchHomework();
  },
  updateHomework: async (id, hw) => {
    await api.request<Homework>(`${homeworkPath}/${id}`, {
      method: "PUT",
      body: hw,
    });
    await get().fetchHomework();
  },
  deleteHomework: async (id) => {
    await api.request<void>(`${homeworkPath}/${id}`, {
      method: "DELETE",
    });
    await get().fetchHomework();
  },
  toggleComplete: async (id) => {
    await api.request<void>(`${homeworkPath}/${id}/complete`, {
      method: "PATCH",
    });
    await get().fetchHomework();
  },
  generateSteps: async (homeworkId) => {
    set((state) => ({
      isGeneratingByHomeworkId: {
        ...state.isGeneratingByHomeworkId,
        [homeworkId]: true,
      },
    }));
    try {
      await api.post<GenerateStepsResponse>(
        `${homeworkPath}/${homeworkId}/generate-steps`,
      );
      await get().fetchHomework();
      set({ error: null });
    } catch {
      set({ error: "Не удалось сгенерировать шаги." });
    } finally {
      set((state) => ({
        isGeneratingByHomeworkId: {
          ...state.isGeneratingByHomeworkId,
          [homeworkId]: false,
        },
      }));
    }
  },
  toggleStep: async (stepId) => {
    try {
      await api.request(`${homeworkPath}/steps/${stepId}/toggle`, {
        method: "PATCH",
      });
      await get().fetchHomework();
      set({ error: null });
    } catch {
      set({ error: "Не удалось обновить шаг." });
    }
  },
  submitMood: async (homeworkId, mood, note) => {
    await api.post("/api/v1/mood", {
      homework_id: homeworkId,
      mood,
      note,
    });
  },
}));
