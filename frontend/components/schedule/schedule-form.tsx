"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { WEEK_DAYS } from "@/components/schedule/constants";
import {
  buildInitialSlotValues,
  hasSlotOverlap,
} from "@/components/schedule/schedule-form-helpers";
import ModalOverlay from "@/components/common/modal-overlay";
import { Button } from "@/components/ui/button";
import type {
  ScheduleSlot,
  ScheduleSlotCreate,
  Subject,
} from "@/types/schedule";

interface ScheduleFormProps {
  isOpen: boolean;
  subjects: Subject[];
  schedule: ScheduleSlot[];
  initialSlot?: ScheduleSlot;
  onClose: () => void;
  onSubmit: (payload: ScheduleSlotCreate) => Promise<void>;
  onDeleteSubject?: (id: string) => Promise<void>;
}

export default function ScheduleForm({
  isOpen,
  subjects,
  schedule,
  initialSlot,
  onClose,
  onSubmit,
  onDeleteSubject,
}: ScheduleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = useMemo(
    () => buildInitialSlotValues(initialSlot, subjects),
    [initialSlot, subjects],
  );

  const [form, setForm] = useState<ScheduleSlotCreate>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  if (!isOpen) return null;

  const handleDeleteSubject = async () => {
    if (!initialSlot || !onDeleteSubject) {
      return;
    }

    const selectedSubject = subjects.find(
      (subject) => subject.id === form.subject_id,
    );
    const isConfirmed = window.confirm(
      `Удалить предмет "${selectedSubject?.name ?? "этот предмет"}"?`,
    );
    if (!isConfirmed) {
      return;
    }

    await onDeleteSubject(form.subject_id);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.end_time <= form.start_time) {
      setError("Время окончания должно быть позже времени начала.");
      return;
    }
    if (hasSlotOverlap(form, schedule, initialSlot?.id)) {
      setError("Этот слот пересекается с существующим уроком.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    await onSubmit(form);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <ModalOverlay open={isOpen} onClose={onClose} className="max-w-lg">
      <form
        className="bg-background w-full space-y-4 rounded-xl p-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold">
          {initialSlot ? "Редактировать урок" : "Добавить урок"}
        </h2>
        <label className="block text-sm">Предмет</label>
        <div className="flex gap-2">
          <select
            className="w-full rounded-md border p-2"
            required
            value={form.subject_id}
            onChange={(event) =>
              setForm({ ...form, subject_id: event.target.value })
            }
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {initialSlot && onDeleteSubject ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeleteSubject()}
            >
              Удалить предмет
            </Button>
          ) : null}
        </div>
        <label className="block text-sm">День недели</label>
        <select
          className="w-full rounded-md border p-2"
          value={form.day_of_week}
          onChange={(event) =>
            setForm({ ...form, day_of_week: Number(event.target.value) })
          }
        >
          {WEEK_DAYS.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded-md border p-2"
            required
            type="time"
            value={form.start_time}
            onChange={(event) =>
              setForm({ ...form, start_time: event.target.value })
            }
          />
          <input
            className="rounded-md border p-2"
            required
            type="time"
            value={form.end_time}
            onChange={(event) =>
              setForm({ ...form, end_time: event.target.value })
            }
          />
        </div>
        <input
          className="w-full rounded-md border p-2"
          placeholder="Кабинет"
          required
          value={form.room}
          onChange={(event) => setForm({ ...form, room: event.target.value })}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button disabled={isSubmitting || !subjects.length} type="submit">
            Сохранить
          </Button>
        </div>
      </form>
    </ModalOverlay>
  );
}
