"use client";

import { useEffect, useMemo, useState } from "react";
import { IconBellPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { useReminderStore } from "@/store/reminders";
import { uiText } from "@/lib/i18n";
import type { ReminderView } from "@/types/reminders";

import { ReminderEditModal } from "./reminder-edit-modal";
import { ReminderList } from "./reminder-list";
import { sortByClosest } from "./reminder-utils";

export function RemindersPageClient() {
  const reminders = useReminderStore((state) => state.reminders);
  const homework = useReminderStore((state) => state.homework);
  const isLoading = useReminderStore((state) => state.isLoading);
  const error = useReminderStore((state) => state.error);
  const fetchReminders = useReminderStore((state) => state.fetchReminders);
  const fetchHomework = useReminderStore((state) => state.fetchHomework);
  const addReminder = useReminderStore((state) => state.addReminder);
  const updateReminder = useReminderStore((state) => state.updateReminder);
  const deleteReminder = useReminderStore((state) => state.deleteReminder);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderView | null>(
    null,
  );

  useEffect(() => {
    void Promise.all([fetchReminders(), fetchHomework()]);
  }, [fetchReminders, fetchHomework]);

  const reminderViews = useMemo(
    () =>
      sortByClosest(
        reminders.map((item) => ({
          ...item,
          homework:
            homework.find((entry) => entry.id === item.homework_id) ?? null,
        })),
      ),
    [reminders, homework],
  );

  const onSubmit = async (payload: {
    homework_id: string;
    remind_at: string;
  }) => {
    if (editingReminder) {
      await updateReminder(editingReminder.id, payload);
      setEditingReminder(null);
      return;
    }
    await addReminder(payload);
  };

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black">Напоминания</h2>
          <p className="text-muted-foreground text-sm">
            Добавляй уведомления о домашних заданиях и не пропускай дедлайны.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <IconBellPlus size={18} /> Добавить напоминание
        </Button>
      </div>
      {error ? (
        <p className="border-destructive/40 text-destructive rounded-md border p-3 text-sm">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">{uiText.common.loading}</p>
      ) : null}
      <ReminderList
        reminders={reminderViews}
        onEdit={(reminder) => {
          setEditingReminder(reminder);
          setModalOpen(true);
        }}
        onDelete={(id) => void deleteReminder(id)}
      />
      <ReminderEditModal
        key={`${editingReminder?.id ?? "new"}-${String(isModalOpen)}`}
        open={isModalOpen}
        homework={homework}
        reminder={editingReminder}
        onClose={() => {
          setModalOpen(false);
          setEditingReminder(null);
        }}
        onSubmit={onSubmit}
      />
    </section>
  );
}

export default RemindersPageClient;
