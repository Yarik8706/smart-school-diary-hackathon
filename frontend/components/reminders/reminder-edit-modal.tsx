import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { Homework, ReminderView } from "@/types/reminders";

import { isFutureDate } from "./reminder-utils";

interface ReminderEditModalProps {
  open: boolean;
  homework: Homework[];
  reminder: ReminderView | null;
  onClose: () => void;
  onSubmit: (payload: {
    homework_id: string;
    remind_at: string;
  }) => Promise<void>;
}

const toInputValue = (isoDate?: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export function ReminderEditModal({
  open,
  homework,
  reminder,
  onClose,
  onSubmit,
}: ReminderEditModalProps) {
  const [homeworkId, setHomeworkId] = useState(
    reminder?.homework_id ?? homework[0]?.id ?? "",
  );
  const [remindAt, setRemindAt] = useState(toInputValue(reminder?.remind_at));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!homeworkId || !isFutureDate(remindAt)) {
      setError("Укажите задание и время в будущем.");
      return;
    }
    setSubmitting(true);
    await onSubmit({
      homework_id: homeworkId,
      remind_at: new Date(remindAt).toISOString(),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        className="bg-background w-full max-w-md space-y-4 rounded-xl border p-6"
        onSubmit={handleSubmit}
      >
        <h3 className="text-xl font-black">
          {reminder ? "Редактировать" : "Добавить"} напоминание
        </h3>
        <label className="block space-y-2 text-sm font-medium">
          Домашнее задание
          <select
            className="bg-background w-full rounded-md border px-3 py-2"
            value={homeworkId}
            onChange={(event) => setHomeworkId(event.target.value)}
          >
            <option value="">Выберите задание</option>
            {homework.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 text-sm font-medium">
          Время напоминания
          <input
            type="datetime-local"
            className="bg-background w-full rounded-md border px-3 py-2"
            value={remindAt}
            onChange={(event) => setRemindAt(event.target.value)}
          />
        </label>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ReminderEditModal;
