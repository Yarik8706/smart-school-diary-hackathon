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
  if (query.get("subject")) items = items.filter((i) => i.subject_id === query.get("subject"));
  if (query.get("status") === "completed") items = items.filter((i) => i.completed);
  if (query.get("status") === "active") items = items.filter((i) => !i.completed);
  return items;
};

export const resolveMockRequest = <T>(endpoint: string, options: ApiRequestOptions = {}): T => {
  const method = (options.method ?? "GET").toUpperCase();
  const { path, query } = splitEndpoint(endpoint);
  const body = options.body;

  if (method === "GET") {
    if (path === "/subjects" || path === "/api/v1/subjects") return [...state.subjects] as T;
    if (path === "/schedule/slots") return [...state.schedule] as T;
    if (path === "/api/v1/homework") return filteredHomework(query) as T;
    if (path === "/api/v1/reminders") return [...state.reminders] as T;
    if (path === "/api/v1/analytics/load") return MOCK_ANALYTICS_LOAD as T;
    if (path === "/api/v1/mood/stats") return MOCK_MOOD_STATS as T;
    if (path === "/api/v1/analytics/warnings") return MOCK_WARNINGS as T;
    if (path === "/api/v1/reminders/pending") return MOCK_PENDING_REMINDERS as T;
  }

  if (path === "/subjects" && method === "POST") {
    const subject = { id: uid(), ...(body as SubjectCreate) };
    state.subjects.unshift(subject);
    return subject as T;
  }
  if (path.startsWith("/subjects/") && method === "PUT") {
    const id = path.replace("/subjects/", "");
    state.subjects = state.subjects.map((s) => (s.id === id ? { ...s, ...(body as SubjectUpdate) } : s));
    return state.subjects.find((s) => s.id === id) as T;
  }
  if (path.startsWith("/subjects/") && method === "DELETE") {
    const id = path.replace("/subjects/", "");
    state.subjects = state.subjects.filter((s) => s.id !== id);
    state.schedule = state.schedule.filter((slot) => slot.subject_id !== id);
    return undefined as T;
  }

  if (path === "/schedule/slots" && method === "POST") {
    const slot = { id: uid(), ...(body as ScheduleSlotCreate) };
    state.schedule.push(slot);
    return slot as T;
  }
  if (path.startsWith("/schedule/slots/") && method === "PUT") {
    const id = path.replace("/schedule/slots/", "");
    state.schedule = state.schedule.map((slot) => (slot.id === id ? { ...slot, ...(body as ScheduleSlotUpdate) } : slot));
    return state.schedule.find((slot) => slot.id === id) as T;
  }
  if (path.startsWith("/schedule/slots/") && method === "DELETE") {
    state.schedule = state.schedule.filter((slot) => slot.id !== path.replace("/schedule/slots/", ""));
    return undefined as T;
  }

  if (path === "/api/v1/homework" && method === "POST") {
    const item = { id: uid(), completed: false, ...(body as HomeworkCreate) };
    state.homework.unshift(item);
    return item as T;
  }
  if (path.endsWith("/complete") && method === "PATCH") {
    const id = path.replace("/api/v1/homework/", "").replace("/complete", "");
    state.homework = state.homework.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
    return undefined as T;
  }
  if (path.startsWith("/api/v1/homework/") && method === "PUT") {
    const id = path.replace("/api/v1/homework/", "");
    state.homework = state.homework.map((i) => (i.id === id ? { ...i, ...(body as object) } : i));
    return state.homework.find((i) => i.id === id) as T;
  }
  if (path.startsWith("/api/v1/homework/") && method === "DELETE") {
    const id = path.replace("/api/v1/homework/", "");
    state.homework = state.homework.filter((i) => i.id !== id);
    state.reminders = state.reminders.filter((r) => r.homework_id !== id);
    return undefined as T;
  }

  if (path === "/api/v1/mood" && method === "POST") {
    const payload = body as { homework_id: string; mood: MoodLevel };
    if (payload.mood === "easy") state.homework = state.homework.map((i) => (i.id === payload.homework_id ? { ...i, completed: true } : i));
    return undefined as T;
  }

  if (path === "/api/v1/reminders" && method === "POST") {
    const item = { id: uid(), status: "pending" as const, ...(body as ReminderCreate) };
    state.reminders.unshift(item);
    return item as T;
  }
  if (path.startsWith("/api/v1/reminders/") && method === "PUT") {
    const id = path.replace("/api/v1/reminders/", "");
    state.reminders = state.reminders.map((r) => (r.id === id ? { ...r, ...(body as ReminderUpdate) } : r));
    return state.reminders.find((r) => r.id === id) as T;
  }
  if (path.startsWith("/api/v1/reminders/") && method === "DELETE") {
    state.reminders = state.reminders.filter((r) => r.id !== path.replace("/api/v1/reminders/", ""));
    return undefined as T;
  }

  throw new Error(`Mock endpoint is not implemented: ${method} ${path}`);
};
