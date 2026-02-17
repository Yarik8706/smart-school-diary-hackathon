import type { MoodStats, WarningItem, WeekLoadAnalysis } from "@/types/analytics";
import type { Homework } from "@/types/homework";
import type { Reminder } from "@/types/reminders";
import type { ScheduleSlot, Subject } from "@/types/schedule";

interface PendingReminderItem {
  id: string;
  title: string;
  due_at?: string;
}

export interface PendingRemindersResponse {
  reminders?: PendingReminderItem[];
}

export const MOCK_SUBJECTS: Subject[] = [
  { id: "sub-1", name: "Математика", color: "blue" },
  { id: "sub-2", name: "Физика", color: "violet" },
  { id: "sub-3", name: "Литература", color: "rose" },
  { id: "sub-4", name: "История", color: "amber" },
  { id: "sub-5", name: "Английский", color: "emerald" },
  { id: "sub-6", name: "Биология", color: "cyan" },
];

export const MOCK_SCHEDULE: ScheduleSlot[] = [
  { id: "slot-1", subject_id: "sub-1", day_of_week: 1, start_time: "08:30", end_time: "09:15", classroom: "101" },
  { id: "slot-2", subject_id: "sub-2", day_of_week: 1, start_time: "10:00", end_time: "10:45", classroom: "207" },
  { id: "slot-3", subject_id: "sub-5", day_of_week: 1, start_time: "11:00", end_time: "11:45", classroom: "305" },
  { id: "slot-4", subject_id: "sub-3", day_of_week: 2, start_time: "09:00", end_time: "09:45", classroom: "209" },
  { id: "slot-5", subject_id: "sub-1", day_of_week: 2, start_time: "10:00", end_time: "10:45", classroom: "101" },
  { id: "slot-6", subject_id: "sub-4", day_of_week: 3, start_time: "08:30", end_time: "09:15", classroom: "112" },
  { id: "slot-7", subject_id: "sub-6", day_of_week: 3, start_time: "09:30", end_time: "10:15", classroom: "220" },
  { id: "slot-8", subject_id: "sub-5", day_of_week: 4, start_time: "10:00", end_time: "10:45", classroom: "305" },
  { id: "slot-9", subject_id: "sub-2", day_of_week: 4, start_time: "11:00", end_time: "11:45", classroom: "207" },
  { id: "slot-10", subject_id: "sub-3", day_of_week: 5, start_time: "09:00", end_time: "09:45", classroom: "209" },
];

export const MOCK_HOMEWORK: Homework[] = [
  { id: "hw-1", subject_id: "sub-1", title: "Упражнения 12-14", description: "Решить задачи из учебника", deadline: "2026-03-01", completed: false },
  { id: "hw-2", subject_id: "sub-2", title: "Лабораторная №3", description: "Подготовить отчёт", deadline: "2026-03-03", completed: false },
  { id: "hw-3", subject_id: "sub-3", title: "Сочинение", description: "Анализ героя", deadline: "2026-03-05", completed: true },
  { id: "hw-4", subject_id: "sub-5", title: "Words revision", description: "Выучить 30 слов", deadline: "2026-03-07", completed: false },
  { id: "hw-5", subject_id: "sub-4", title: "Параграф 8", description: "Сделать конспект", deadline: "2026-03-10", completed: false },
];

export const MOCK_REMINDERS: Reminder[] = [
  { id: "rem-1", homework_id: "hw-1", remind_at: "2026-02-28T15:00:00.000Z", status: "pending" },
  { id: "rem-2", homework_id: "hw-2", remind_at: "2026-03-02T12:30:00.000Z", status: "pending" },
  { id: "rem-3", homework_id: "hw-3", remind_at: "2026-03-04T09:00:00.000Z", status: "sent" },
  { id: "rem-4", homework_id: "hw-4", remind_at: "2026-03-06T16:15:00.000Z", status: "pending" },
];

export const MOCK_ANALYTICS_LOAD: WeekLoadAnalysis = {
  days: [
    { day: "Пн", load: 4 },
    { day: "Вт", load: 5 },
    { day: "Ср", load: 6 },
    { day: "Чт", load: 4 },
    { day: "Пт", load: 3 },
  ],
};

export const MOCK_MOOD_STATS: MoodStats = {
  easy: 7,
  normal: 12,
  hard: 5,
};

export const MOCK_WARNINGS: WarningItem[] = [
  { id: "warn-1", day: "Среда", message: "Высокая нагрузка", recommendation: "Разбейте домашние задания на 2 сессии." },
  { id: "warn-2", day: "Вторник", message: "Мало времени на отдых", recommendation: "Сделайте 20-минутный перерыв после школы." },
];

export const MOCK_PENDING_REMINDERS: PendingRemindersResponse = {
  reminders: [
    { id: "rem-1", title: "Упражнения 12-14", due_at: "Сегодня 15:00" },
    { id: "rem-2", title: "Лабораторная №3", due_at: "Завтра 12:30" },
  ],
};
