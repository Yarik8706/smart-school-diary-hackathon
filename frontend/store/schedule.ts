import { create } from "zustand";

import { api } from "@/lib/api-client";
import type {
  ScheduleSlot,
  ScheduleSlotCreate,
  ScheduleSlotUpdate,
  Subject,
  SubjectCreate,
  SubjectUpdate,
} from "@/types/schedule";

interface ScheduleStore {
  subjects: Subject[];
  schedule: ScheduleSlot[];
  isLoading: boolean;
  selectedDay: number | null;
  error: string | null;
  fetchSubjects: () => Promise<void>;
  fetchSchedule: () => Promise<void>;
  createSubject: (data: SubjectCreate) => Promise<void>;
  updateSubject: (id: string, data: SubjectUpdate) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  createSlot: (data: ScheduleSlotCreate) => Promise<void>;
  updateSlot: (id: string, data: ScheduleSlotUpdate) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
  setSelectedDay: (day: number | null) => void;
}

const subjectPath = "/subjects";
const schedulePath = "/schedule/slots";

const withLoading = async (
  action: () => Promise<void>,
  setLoading: () => void,
) => {
  setLoading();
  await action();
};

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  subjects: [],
  schedule: [],
  isLoading: false,
  selectedDay: null,
  error: null,
  fetchSubjects: async () => {
    await withLoading(
      async () => {
        try {
          const subjects = await api.get<Subject[]>(subjectPath);
          set({ subjects, error: null });
        } catch {
          set({ error: "Не удалось загрузить предметы." });
        } finally {
          set({ isLoading: false });
        }
      },
      () => set({ isLoading: true }),
    );
  },
  fetchSchedule: async () => {
    await withLoading(
      async () => {
        try {
          const schedule = await api.get<ScheduleSlot[]>(schedulePath);
          set({ schedule, error: null });
        } catch {
          set({ error: "Не удалось загрузить расписание." });
        } finally {
          set({ isLoading: false });
        }
      },
      () => set({ isLoading: true }),
    );
  },
  createSubject: async (data) => {
    await api.post<Subject>(subjectPath, data);
    await get().fetchSubjects();
  },
  updateSubject: async (id, data) => {
    await api.request<Subject>(`${subjectPath}/${id}`, {
      method: "PUT",
      body: data,
    });
    await get().fetchSubjects();
  },
  deleteSubject: async (id) => {
    await api.request<void>(`${subjectPath}/${id}`, { method: "DELETE" });
    await Promise.all([get().fetchSubjects(), get().fetchSchedule()]);
  },
  createSlot: async (data) => {
    await api.post<ScheduleSlot>(schedulePath, data);
    await get().fetchSchedule();
  },
  updateSlot: async (id, data) => {
    await api.request<ScheduleSlot>(`${schedulePath}/${id}`, {
      method: "PUT",
      body: data,
    });
    await get().fetchSchedule();
  },
  deleteSlot: async (id) => {
    await api.request<void>(`${schedulePath}/${id}`, {
      method: "DELETE",
    });
    await get().fetchSchedule();
  },
  setSelectedDay: (day) => set({ selectedDay: day }),
}));
