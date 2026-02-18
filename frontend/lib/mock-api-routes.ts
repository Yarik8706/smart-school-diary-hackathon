import type { ApiRequestOptions } from "@/types/api";
import type { HomeworkCreate, MoodLevel } from "@/types/homework";
import type { ReminderCreate, ReminderUpdate } from "@/types/reminders";
import type {
  ScheduleSlotCreate,
  ScheduleSlotUpdate,
  SubjectCreate,
  SubjectUpdate,
} from "@/types/schedule";

import {
  MOCK_ANALYTICS_LOAD,
  MOCK_HOMEWORK,
  MOCK_MOOD_STATS,
  MOCK_PENDING_REMINDERS,
  MOCK_REMINDERS,
  MOCK_SCHEDULE,
  MOCK_SUBJECTS,
  MOCK_WARNINGS,
} from "@/lib/mock-data";

const uid = () => `mock-${crypto.randomUUID()}`;
const splitEndpoint = (endpoint: string) => {
  const [path, query = ""] = endpoint.split("?");
  return { path, query: new URLSearchParams(query) };
};

const state = {
  subjects: [...MOCK_SUBJECTS],
  schedule: [...MOCK_SCHEDULE],
  homework: [...MOCK_HOMEWORK],
  reminders: [...MOCK_REMINDERS],
};

const filteredHomework = (query: URLSearchParams) => {
  let items = [...state.homework];
  const subjectId = query.get("subject_id");
  const isCompleted = query.get("is_completed");
  const deadlineFrom = query.get("deadline_from");
  const deadlineTo = query.get("deadline_to");

  if (subjectId) items = items.filter((item) => item.subject_id === subjectId);
  if (isCompleted === "true") items = items.filter((item) => item.is_completed);
  if (isCompleted === "false") items = items.filter((item) => !item.is_completed);
  if (deadlineFrom) items = items.filter((item) => item.deadline >= deadlineFrom);
  if (deadlineTo) items = items.filter((item) => item.deadline <= deadlineTo);

  return items;
};

export const resolveMockRequest = <T>(endpoint: string, options: ApiRequestOptions = {}): T => {
  const method = (options.method ?? "GET").toUpperCase();
  const { path, query } = splitEndpoint(endpoint);
  const body = options.body;

  if (method === "GET") {
    if (path === "/subjects" || path === "/api/v1/subjects") return [...state.subjects] as T;
    if (path === "/api/v1/schedule" || path === "/schedule") return [...state.schedule] as T;
    if (path === "/api/v1/homework") return filteredHomework(query) as T;
    if (path === "/api/v1/reminders") return [...state.reminders] as T;
    if (path === "/api/v1/analytics/load") return MOCK_ANALYTICS_LOAD as T;
    if (path === "/api/v1/mood/stats") return MOCK_MOOD_STATS as T;
    if (path === "/api/v1/analytics/warnings") return { warnings: MOCK_WARNINGS } as T;
    if (path === "/api/v1/reminders/pending") return MOCK_PENDING_REMINDERS as T;
  }

  if ((path === "/api/v1/subjects" || path === "/subjects") && method === "POST") {
    const subject = { id: uid(), ...(body as SubjectCreate) };
    state.subjects.unshift(subject);
    return subject as T;
  }
  if ((path.startsWith("/api/v1/subjects/") || path.startsWith("/subjects/")) && method === "PUT") {
    const id = path.replace("/api/v1/subjects/", "").replace("/subjects/", "");
    state.subjects = state.subjects.map((s) => (s.id === id ? { ...s, ...(body as SubjectUpdate) } : s));
    return state.subjects.find((s) => s.id === id) as T;
  }
  if ((path.startsWith("/api/v1/subjects/") || path.startsWith("/subjects/")) && method === "DELETE") {
    const id = path.replace("/api/v1/subjects/", "").replace("/subjects/", "");
    state.subjects = state.subjects.filter((s) => s.id !== id);
    state.schedule = state.schedule.filter((slot) => slot.subject_id !== id);
    return undefined as T;
  }

  if ((path === "/api/v1/schedule" || path === "/schedule") && method === "POST") {
    const slot = { id: uid(), ...(body as ScheduleSlotCreate) };
    state.schedule.push(slot);
    return slot as T;
  }
  if ((path.startsWith("/api/v1/schedule/") || path.startsWith("/schedule/")) && method === "PUT") {
    const id = path.replace("/api/v1/schedule/", "").replace("/schedule/", "");
    state.schedule = state.schedule.map((slot) => (slot.id === id ? { ...slot, ...(body as ScheduleSlotUpdate) } : slot));
    return state.schedule.find((slot) => slot.id === id) as T;
  }
  if ((path.startsWith("/api/v1/schedule/") || path.startsWith("/schedule/")) && method === "DELETE") {
    const id = path.replace("/api/v1/schedule/", "").replace("/schedule/", "");
    state.schedule = state.schedule.filter((slot) => slot.id !== id);
    return undefined as T;
  }

  if (path === "/api/v1/homework" && method === "POST") {
    const item = { id: uid(), is_completed: false, ...(body as HomeworkCreate) };
    state.homework.unshift(item);
    return item as T;
  }
  if (path.endsWith("/complete") && method === "PATCH") {
    const id = path.replace("/api/v1/homework/", "").replace("/complete", "");
    state.homework = state.homework.map((item) =>
      item.id === id ? { ...item, is_completed: !item.is_completed } : item,
    );
    return undefined as T;
  }
  if (path.endsWith("/generate-steps") && method === "POST") {
    const id = path.replace("/api/v1/homework/", "").replace("/generate-steps", "");
    const target = state.homework.find((item) => item.id === id);
    const steps = [
      { id: uid(), title: "Прочитать условие и выделить главное", order: 1, is_completed: false },
      { id: uid(), title: "Составить короткий план решения", order: 2, is_completed: false },
      { id: uid(), title: "Проверить и оформить ответ", order: 3, is_completed: false },
    ];
    if (target) Object.assign(target, { steps });
    return { steps, count: steps.length } as T;
  }
  if (path.includes("/steps/") && path.endsWith("/toggle") && method === "PATCH") {
    const stepId = path.replace("/api/v1/homework/steps/", "").replace("/toggle", "");
    state.homework = state.homework.map((item) => ({
      ...item,
      steps: item.steps?.map((step) =>
        step.id === stepId ? { ...step, is_completed: !step.is_completed } : step,
      ),
    }));
    return undefined as T;
  }
  if (path.startsWith("/api/v1/homework/") && method === "PUT") {
    const id = path.replace("/api/v1/homework/", "");
    state.homework = state.homework.map((item) => (item.id === id ? { ...item, ...(body as object) } : item));
    return state.homework.find((item) => item.id === id) as T;
  }
  if (path.startsWith("/api/v1/homework/") && method === "DELETE") {
    const id = path.replace("/api/v1/homework/", "");
    state.homework = state.homework.filter((item) => item.id !== id);
    state.reminders = state.reminders.filter((reminder) => reminder.homework_id !== id);
    return undefined as T;
  }

  if (path === "/api/v1/mood" && method === "POST") {
    const payload = body as { homework_id: string; mood: MoodLevel };
    if (payload.mood === "easy") {
      state.homework = state.homework.map((item) =>
        item.id === payload.homework_id ? { ...item, is_completed: true } : item,
      );
    }
    return undefined as T;
  }

  if (path === "/api/v1/reminders" && method === "POST") {
    const item = { id: uid(), is_sent: false, ...(body as ReminderCreate) };
    state.reminders.unshift(item);
    return item as T;
  }
  if (path.startsWith("/api/v1/reminders/") && method === "PUT") {
    const id = path.replace("/api/v1/reminders/", "");
    state.reminders = state.reminders.map((reminder) =>
      reminder.id === id ? { ...reminder, ...(body as ReminderUpdate) } : reminder,
    );
    return state.reminders.find((reminder) => reminder.id === id) as T;
  }
  if (path.startsWith("/api/v1/reminders/") && method === "DELETE") {
    state.reminders = state.reminders.filter((reminder) => reminder.id !== path.replace("/api/v1/reminders/", ""));
    return undefined as T;
  }

  throw new Error(`Mock endpoint is not implemented: ${method} ${path}`);
};
