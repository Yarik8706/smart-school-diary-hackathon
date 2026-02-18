"use client";

import { useState } from "react";

import {
  SUBJECT_COLORS,
  getSubjectColorClass,
} from "@/components/schedule/constants";
import ModalOverlay from "@/components/common/modal-overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types/schedule";

interface SubjectManagerProps {
  isOpen: boolean;
  subjects: Subject[];
  onClose: () => void;
  onCreate: (name: string, color: string) => Promise<void>;
  onUpdate: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function SubjectManager({
  isOpen,
  subjects,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: SubjectManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("blue");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setColor("blue");
    setEditingId(null);
  };

  const submit = async () => {
    if (!name.trim()) return;
    if (editingId) {
      await onUpdate(editingId, name.trim(), color);
    } else {
      await onCreate(name.trim(), color);
    }
    resetForm();
  };

  return (
    <ModalOverlay open={isOpen} onClose={onClose} className="max-w-2xl">
      <section className="bg-background w-full space-y-4 rounded-xl p-6">
        <h2 className="text-2xl font-semibold">Управление предметами</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            className="rounded-md border p-2"
            placeholder="Название предмета"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <select
            className="rounded-md border p-2"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          >
            {SUBJECT_COLORS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <Button onClick={submit}>
            {editingId ? "Обновить" : "Добавить"}
          </Button>
        </div>
        <ul className="space-y-2">
          {subjects.map((subject) => (
            <li
              key={subject.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full",
                  getSubjectColorClass(subject.color),
                )}
              />
              <p className="flex-1 text-sm font-medium">{subject.name}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingId(subject.id);
                  setName(subject.name);
                  setColor(subject.color);
                }}
              >
                Редактировать
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(subject.id)}
              >
                Удалить
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </section>
    </ModalOverlay>
  )
}
