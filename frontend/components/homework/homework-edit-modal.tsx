import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { Homework, HomeworkCreate, Subject } from "@/types/homework";

interface HomeworkEditModalProps {
  open: boolean;
  subjects: Subject[];
  homework: Homework | null;
  onClose: () => void;
  onSubmit: (payload: HomeworkCreate) => Promise<void>;
}

const toInputDate = (value?: string) => value?.slice(0, 10) ?? "";

const isPastDate = (value: string) => {
  if (!value) return true;
  const today = new Date();
  const check = new Date(value);
  today.setHours(0, 0, 0, 0);
  check.setHours(0, 0, 0, 0);
  return check < today;
};

export function HomeworkEditModal({
  open,
  subjects,
  homework,
  onClose,
  onSubmit,
}: HomeworkEditModalProps) {
  const [subjectId, setSubjectId] = useState(
    homework?.subject_id ?? subjects[0]?.id ?? "",
  );
  const [title, setTitle] = useState(homework?.title ?? "");
  const [description, setDescription] = useState(homework?.description ?? "");
  const [deadline, setDeadline] = useState(toInputDate(homework?.deadline));
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Название обязательно.");
      return;
    }
    if (isPastDate(deadline)) {
      setError("Дедлайн не может быть в прошлом.");
      return;
    }
    await onSubmit({
      subject_id: subjectId,
      title: title.trim(),
      description,
      deadline,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        className="bg-background w-full max-w-xl space-y-4 rounded-xl border p-6"
        onSubmit={handleSubmit}
      >
        <h3 className="text-xl font-black">
          {homework ? "Редактировать" : "Добавить"} ДЗ
        </h3>
        <label className="block space-y-1 text-sm font-medium">
          Предмет
          <select
            className="bg-background w-full rounded-md border px-3 py-2"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Название
          <input
            aria-label="Название"
            className="bg-background w-full rounded-md border px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Описание
          <textarea
            aria-label="Описание"
            className="bg-background min-h-24 w-full rounded-md border px-3 py-2"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Дедлайн
          <input
            type="date"
            aria-label="Дедлайн"
            className="bg-background w-full rounded-md border px-3 py-2"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </label>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </div>
  );
}

export default HomeworkEditModal;
