import { IconMoodSmile, IconPencil, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import type { Homework, Subject } from "@/types/homework";

import { getStepsProgress, isPastDeadline } from "./homework-utils";

interface HomeworkCardProps {
  homework: Homework;
  subject?: Subject;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onMood: (homework: Homework) => void;
}

export function HomeworkCard({
  homework,
  subject,
  onEdit,
  onDelete,
  onToggle,
  onMood,
}: HomeworkCardProps) {
  const progress = getStepsProgress(homework.steps);

  return (
    <article className="space-y-3 rounded-xl border p-4" data-homework-card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold text-white ${subject?.color ?? "bg-zinc-500"}`}
          >
            {subject?.name ?? "Без предмета"}
          </span>
          <h3 className="mt-2 text-lg font-black">{homework.title}</h3>
          <p className="text-muted-foreground text-sm">
            {homework.description || "Без описания"}
          </p>
        </div>
      </div>
      <p
        className={`text-sm ${isPastDeadline(homework.deadline) ? "text-red-500" : "text-muted-foreground"}`}
      >
        Дедлайн: {new Date(homework.deadline).toLocaleDateString("ru-RU")}
      </p>
      {homework.steps?.length ? (
        <div className="space-y-1">
          <p className="text-xs">Прогресс: {progress}%</p>
          <progress
            className="h-2 w-full overflow-hidden rounded-full"
            max={100}
            value={progress}
          />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={homework.completed}
            onChange={() => onToggle(homework.id)}
          />
          Выполнено
        </label>
        <Button size="sm" variant="outline" onClick={() => onEdit(homework)}>
          <IconPencil size={16} /> Редактировать
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onMood(homework)}>
          <IconMoodSmile size={16} /> Оценить сложность
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(homework.id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <IconTrash size={16} /> Удалить
        </Button>
      </div>
    </article>
  );
}

export default HomeworkCard;
