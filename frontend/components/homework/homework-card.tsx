import {
  IconCheck,
  IconChecklist,
  IconLoader2,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import type { Homework, Subject } from "@/types/homework";

import { getStepsProgress, isPastDeadline } from "./homework-utils";

interface HomeworkCardProps {
  homework: Homework;
  subject?: Subject;
  isGeneratingSteps?: boolean;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
  onDone: (homework: Homework) => void;
  onGenerateSteps: (id: string) => void;
  onToggleStep: (id: string) => void;
}

export function HomeworkCard({
  homework,
  subject,
  isGeneratingSteps = false,
  onEdit,
  onDelete,
  onDone,
  onGenerateSteps,
  onToggleStep,
}: HomeworkCardProps) {
  const progress = getStepsProgress(homework.steps);
  const hasSteps = Boolean(homework.steps?.length);

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
      {hasSteps ? (
        <div className="space-y-2">
          <p className="text-xs">Прогресс: {progress}%</p>
          <progress
            className="h-2 w-full overflow-hidden rounded-full"
            max={100}
            value={progress}
          />
          <ul className="space-y-1">
            {homework.steps?.map((step) => (
              <li key={step.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={step.is_completed}
                    onChange={() => onToggleStep(step.id)}
                  />
                  <span
                    className={step.is_completed ? "text-muted-foreground line-through" : ""}
                  >
                    {step.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onDone(homework)}>
          <IconCheck size={16} /> Сделано
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isGeneratingSteps}
          onClick={() => onGenerateSteps(homework.id)}
        >
          {isGeneratingSteps ? (
            <>
              <IconLoader2 size={16} className="animate-spin" /> Генерация...
            </>
          ) : (
            <>
              <IconChecklist size={16} /> Сгенерировать шаги
            </>
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(homework)}>
          <IconPencil size={16} /> Редактировать
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
