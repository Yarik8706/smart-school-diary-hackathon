import { create } from "zustand";

import { api } from "@/lib/api-client";
import type { WarningsResponse } from "@/types/analytics";
import type { DashboardSummary } from "@/types/dashboard";
import type { Homework } from "@/types/homework";
import type { ScheduleSlot, Subject } from "@/types/schedule";

interface DashboardStore {
  summary: DashboardSummary;
  isLoading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

const emptySummary: DashboardSummary = {
  nearestHomework: null,
  todayLessons: { count: 0, subjects: [] },
  warnings: { count: 0, description: "Рисков не найдено." },
};

const getRemainingText = (deadline: string) => {
  const target = new Date(deadline);
  target.setHours(23, 59, 59, 999);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) {
    return "Срок прошёл";
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Сдать сегодня";
  if (diffDays === 1) return "1 день до дедлайна";
  return `${diffDays} дн. до дедлайна`;
};

const getNearestHomework = (homework: Homework[]) => {
  const nearest = homework
    .filter((item) => !item.is_completed)
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )[0];

  if (!nearest) {
    return null;
  }

  return {
    title: nearest.title,
    deadline: nearest.deadline,
    remaining: getRemainingText(nearest.deadline),
  };
};

const getTodayLessons = (slots: ScheduleSlot[], subjects: Subject[]) => {
  const day = new Date().getDay();
  const currentDay = day === 0 ? 7 : day;
  const subjectMap = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  );

  const todaySlots = slots
    .filter((slot) => slot.day_of_week === currentDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const names = todaySlots
    .map((slot) => subjectMap.get(slot.subject_id))
    .filter((subject): subject is string => Boolean(subject));

  return {
    count: todaySlots.length,
    subjects: Array.from(new Set(names)),
  };
};

const getWarnings = (warnings: string[]) => {
  if (warnings.length === 0) {
    return emptySummary.warnings;
  }

  return {
    count: warnings.length,
    description: warnings[0],
  };
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  summary: emptySummary,
  isLoading: false,
  error: null,
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });

    try {
      const [homework, slots, subjects, warnings] = await Promise.all([
        api.get<Homework[]>("/api/v1/homework"),
        api.get<ScheduleSlot[]>("/api/v1/schedule"),
        api.get<Subject[]>("/api/v1/subjects"),
        api.get<WarningsResponse>("/api/v1/analytics/warnings"),
      ]);

      set({
        summary: {
          nearestHomework: getNearestHomework(homework),
          todayLessons: getTodayLessons(slots, subjects),
          warnings: getWarnings(warnings.warnings),
        },
      });
    } catch {
      set({
        summary: emptySummary,
        error: "Не удалось загрузить сводку дашборда.",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
