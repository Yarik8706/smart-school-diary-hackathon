import { describe, expect, it } from "vitest";

import type { ReminderView } from "@/types/reminders";

import { groupReminders, isFutureDate, sortByClosest } from "../reminder-utils";

const makeReminder = (id: string, remindAt: string): ReminderView => ({
  id,
  homework_id: `h-${id}`,
  remind_at: remindAt,
  status: "pending",
  homework: null,
});

describe("reminder-utils", () => {
  it("sorts reminders by closest time", () => {
    const reminders = [
      makeReminder("later", "2026-01-03T10:00:00.000Z"),
      makeReminder("soon", "2026-01-01T10:00:00.000Z"),
      makeReminder("middle", "2026-01-02T10:00:00.000Z"),
    ];

    expect(sortByClosest(reminders).map((item) => item.id)).toEqual([
      "soon",
      "middle",
      "later",
    ]);
  });

  it("groups reminders by relative day ranges", () => {
    const now = new Date("2026-01-01T08:00:00.000Z");
    const reminders = [
      makeReminder("today", "2026-01-01T12:00:00.000Z"),
      makeReminder("tomorrow", "2026-01-02T12:00:00.000Z"),
      makeReminder("week", "2026-01-05T12:00:00.000Z"),
      makeReminder("later", "2026-01-09T12:00:00.000Z"),
    ];

    const groups = groupReminders(reminders, now);

    expect(groups.map((group) => group.key)).toEqual([
      "today",
      "tomorrow",
      "week",
      "later",
    ]);
  });

  it("validates future dates", () => {
    const now = new Date("2026-01-01T08:00:00.000Z");

    expect(isFutureDate("2026-01-01T09:00", now)).toBe(true);
    expect(isFutureDate("2026-01-01T07:00", now)).toBe(false);
    expect(isFutureDate("", now)).toBe(false);
  });
});
