import { useMemo, useState, type FormEvent } from "react";

import ModalOverlay from "@/components/common/modal-overlay";
import { Button } from "@/components/ui/button";
import type { Homework, ReminderView } from "@/types/reminders";

import { isFutureDate } from "./reminder-utils";

interface ReminderEditModalProps {
  open: boolean;
  homework: Homework[];
  reminder: ReminderView | null;
  onClose: () => void;
  onSubmit: (payload: {
    homework_id?: string;
    remind_at: string;
  }) => Promise<void>;
}

const splitIsoDateTime = (isoDate?: string) => {
  if (!isoDate) {
    return { dateValue: "", timeValue: "" };
  }

  const date = new Date(isoDate);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  const [dateValue, timeValue = ""] = local
    .toISOString()
    .slice(0, 16)
    .split("T");

  return { dateValue, timeValue };
};

export function ReminderEditModal({
  open,
  homework,
  reminder,
  onClose,
  onSubmit,
}: ReminderEditModalProps) {
  const initialDateTime = useMemo(
    () => splitIsoDateTime(reminder?.remind_at),
    [reminder?.remind_at],
  );

  const [homeworkId, setHomeworkId] = useState(
    reminder?.homework_id ?? homework[0]?.id ?? "",
  );
  const [dateValue, setDateValue] = useState(initialDateTime.dateValue);
  const [timeValue, setTimeValue] = useState(initialDateTime.timeValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const combinedDateTime =
      dateValue && timeValue ? `${dateValue}T${timeValue}` : "";
    if ((!reminder && !homeworkId) || !isFutureDate(combinedDateTime)) {
      setError("Укажите задание и время в будущем.");
      return;
    }

    setSubmitting(true);
    await onSubmit({
      homework_id: reminder ? undefined : homeworkId,
      remind_at: new Date(combinedDateTime).toISOString(),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <ModalOverlay open={open} onClose={onClose} className="max-w-md">
      <form
        className="bg-background w-full space-y-4 rounded-xl border p-6"
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
            disabled={Boolean(reminder)}
          >
            <option value="">Выберите задание</option>
            {homework.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium">
            Дата
            <input
              type="date"
              className="bg-background w-full rounded-md border px-3 py-2"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Время
            <input
              type="time"
              className="bg-background w-full rounded-md border px-3 py-2"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
            />
          </label>
        </div>
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
    </ModalOverlay>
  );
}

export default ReminderEditModal;
