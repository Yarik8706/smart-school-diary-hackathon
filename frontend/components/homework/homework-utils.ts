import type {
  Homework,
  HomeworkDeadlineFilter,
  HomeworkFiltersState,
} from "@/types/homework";

const isInCurrentWeek = (value: Date, now: Date) => {
  const day = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return value >= weekStart && value < weekEnd;
};

const matchesDeadline = (
  deadline: string,
  filter: HomeworkDeadlineFilter,
  now: Date,
) => {
  if (filter === "all") return true;
  const date = new Date(deadline);
  if (filter === "week") return isInCurrentWeek(date, now);
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

export const sortByDeadline = (items: Homework[]) =>
  [...items].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );

export const filterHomework = (
  items: Homework[],
  filters: HomeworkFiltersState,
  now = new Date(),
) =>
  items.filter((item) => {
    if (filters.subject !== "all" && item.subject_id !== filters.subject)
      return false;
    if (filters.status === "completed" && !item.is_completed) return false;
    if (filters.status === "active" && item.is_completed) return false;
    return matchesDeadline(item.deadline, filters.deadline, now);
  });

export const getStepsProgress = (steps?: Homework["steps"]) => {
  if (!steps?.length) return 0;
  const done = steps.filter((step) => step.is_completed).length;
  return Math.round((done / steps.length) * 100);
};

export const isPastDeadline = (deadline: string) => {
  const now = new Date();
  const date = new Date(deadline);
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < now;
};
