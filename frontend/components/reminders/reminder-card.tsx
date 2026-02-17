import { IconEdit, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { uiText } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ReminderView } from "@/types/reminders";

interface ReminderCardProps {
  reminder: ReminderView;
  onEdit: (reminder: ReminderView) => void;
  onDelete: (id: string) => void;
}

const statusClass: Record<ReminderView["status"], string> = {
  pending: "bg-blue-500/20 text-blue-700",
  sent: "bg-zinc-400/20 text-zinc-600",
};

const statusText: Record<ReminderView["status"], string> = {
  pending: uiText.reminders.status.pending,
  sent: uiText.reminders.status.sent,
};

const subjectDot: Record<string, string> = {
  "bg-blue-500": "bg-blue-500",
  "bg-emerald-500": "bg-emerald-500",
  "bg-violet-500": "bg-violet-500",
  "bg-amber-500": "bg-amber-500",
  "bg-rose-500": "bg-rose-500",
};

export function ReminderCard({
  reminder,
  onEdit,
  onDelete,
}: ReminderCardProps) {
  const markerClass =
    subjectDot[reminder.homework?.subject_color ?? ""] ?? "bg-slate-500";

  return (
    <article className="bg-card rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold">
            {reminder.homework?.title ?? "Без задания"}
          </p>
          <p className="text-muted-foreground text-sm">
            {new Date(reminder.remind_at).toLocaleString("ru-RU")}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-semibold",
            statusClass[reminder.status],
          )}
        >
          {statusText[reminder.status]}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm">
          <span
            className={cn("size-2 rounded-full", markerClass)}
            aria-hidden
          />
          {reminder.homework?.subject ?? uiText.common.noSubject}
        </p>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto sm:flex-nowrap">
          <Button size="sm" variant="outline" onClick={() => onEdit(reminder)}>
            <IconEdit size={16} /> Редактировать
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(reminder.id)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <IconTrash size={16} /> Удалить
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ReminderCard;
