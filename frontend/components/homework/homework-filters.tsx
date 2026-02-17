import type { HomeworkFiltersState, Subject } from "@/types/homework";

interface HomeworkFiltersProps {
  subjects: Subject[];
  value: HomeworkFiltersState;
  onChange: (filters: HomeworkFiltersState) => void;
}

export function HomeworkFilters({
  subjects,
  value,
  onChange,
}: HomeworkFiltersProps) {
  const update = <K extends keyof HomeworkFiltersState>(
    key: K,
    next: HomeworkFiltersState[K],
  ) => onChange({ ...value, [key]: next });

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Фильтры домашних заданий"
    >
      <label className="space-y-1 text-sm font-medium">
        Предмет
        <select
          aria-label="Предмет"
          className="bg-background w-full rounded-md border px-3 py-2"
          value={value.subject}
          onChange={(event) => update("subject", event.target.value)}
        >
          <option value="all">Все</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium">
        Статус
        <select
          aria-label="Статус"
          className="bg-background w-full rounded-md border px-3 py-2"
          value={value.status}
          onChange={(event) =>
            update(
              "status",
              event.target.value as HomeworkFiltersState["status"],
            )
          }
        >
          <option value="all">Все</option>
          <option value="completed">Выполнено</option>
          <option value="active">Не выполнено</option>
        </select>
      </label>
      <label className="space-y-1 text-sm font-medium sm:col-span-2 lg:col-span-1">
        Дедлайн
        <select
          aria-label="Дедлайн"
          className="bg-background w-full rounded-md border px-3 py-2"
          value={value.deadline}
          onChange={(event) =>
            update(
              "deadline",
              event.target.value as HomeworkFiltersState["deadline"],
            )
          }
        >
          <option value="all">Все</option>
          <option value="week">Эта неделя</option>
          <option value="month">Этот месяц</option>
        </select>
      </label>
    </section>
  );
}

export default HomeworkFilters;
