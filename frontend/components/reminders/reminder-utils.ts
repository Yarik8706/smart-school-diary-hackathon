import type { ReminderView } from "@/types/reminders";
import { uiText } from "@/lib/i18n";

export interface ReminderGroup {
  key: "overdue" | "today" | "tomorrow" | "week" | "later";
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
    { key: "overdue", title: uiText.reminders.groups.overdue, items: [] },
    { key: "today", title: uiText.reminders.groups.today, items: [] },
    { key: "tomorrow", title: uiText.reminders.groups.tomorrow, items: [] },
    { key: "week", title: uiText.reminders.groups.week, items: [] },
    { key: "later", title: uiText.reminders.groups.later, items: [] },
  ];

  sortByClosest(reminders).forEach((item) => {
    const reminderTime = new Date(item.remind_at).getTime();

    if (reminderTime < todayStart) {
      groups[0].items.push(item);
      return;
    }
    if (reminderTime < tomorrowStart) {
      groups[1].items.push(item);
      return;
    }
    if (reminderTime < tomorrowStart + dayMs) {
      groups[2].items.push(item);
      return;
    }
    if (reminderTime < weekEnd) {
      groups[3].items.push(item);
      return;
    }
    groups[4].items.push(item);
  });

  return groups.filter((group) => group.items.length > 0);
};

export const isFutureDate = (value: string, now = new Date()) => {
  const selected = new Date(value).getTime();
  return Number.isFinite(selected) && selected > now.getTime();
};
