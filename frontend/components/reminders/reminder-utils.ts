import type { ReminderView } from "@/types/reminders";

export interface ReminderGroup {
  key: "today" | "tomorrow" | "week" | "later";
  title: string;
  items: ReminderView[];
}

const dayMs = 86_400_000;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const sortByClosest = (reminders: ReminderView[]) =>
  [...reminders].sort(
    (a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime(),
  );

export const groupReminders = (
  reminders: ReminderView[],
  now: Date = new Date(),
): ReminderGroup[] => {
  const todayStart = startOfDay(now);
  const tomorrowStart = todayStart + dayMs;
  const weekEnd = todayStart + dayMs * 7;

  const groups: ReminderGroup[] = [
    { key: "today", title: "Сегодня", items: [] },
    { key: "tomorrow", title: "Завтра", items: [] },
    { key: "week", title: "На этой неделе", items: [] },
    { key: "later", title: "Позднее", items: [] },
  ];

  sortByClosest(reminders).forEach((item) => {
    const reminderTime = new Date(item.remind_at).getTime();

    if (reminderTime < tomorrowStart) {
      groups[0].items.push(item);
      return;
    }
    if (reminderTime < tomorrowStart + dayMs) {
      groups[1].items.push(item);
      return;
    }
    if (reminderTime < weekEnd) {
      groups[2].items.push(item);
      return;
    }
    groups[3].items.push(item);
  });

  return groups.filter((group) => group.items.length > 0);
};

export const isFutureDate = (value: string, now = new Date()) => {
  const selected = new Date(value).getTime();
  return Number.isFinite(selected) && selected > now.getTime();
};
