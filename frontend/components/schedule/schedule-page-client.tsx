"use client";

import { useEffect, useMemo, useState } from "react";

import ScheduleForm from "@/components/schedule/schedule-form";
import ScheduleGrid from "@/components/schedule/schedule-grid";
import SubjectManager from "@/components/schedule/subject-manager";
import { WEEK_DAYS } from "@/components/schedule/constants";
import { Button } from "@/components/ui/button";
import { useScheduleStore } from "@/store/schedule";
import type { ScheduleSlot, ScheduleSlotCreate } from "@/types/schedule";

export default function SchedulePageClient() {
  const {
    subjects,
    schedule,
    error,
    isLoading,
    selectedDay,
    fetchSchedule,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    createSlot,
    updateSlot,
    deleteSlot,
    setSelectedDay,
  } = useScheduleStore();

  const [isSlotFormOpen, setIsSlotFormOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | undefined>(
    undefined,
  );

  useEffect(() => {
    void Promise.all([fetchSubjects(), fetchSchedule()]);
  }, [fetchSubjects, fetchSchedule]);

  const activeDay = useMemo(
    () => selectedDay ?? WEEK_DAYS[0].value,
    [selectedDay],
  );

  const handleSubmitSlot = async (payload: ScheduleSlotCreate) => {
    if (editingSlot) {
      await updateSlot(editingSlot.id, payload);
      setEditingSlot(undefined);
      return;
    }
    await createSlot(payload);
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:px-2 py-0 md:px-6 md:py-10">
      <header className="space-y-3">
        <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
          расписание
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
            План на неделю
          </h2>
          <div className="flex w-full gap-2 md:w-auto">
            <Button variant="outline" onClick={() => setIsSubjectsOpen(true)}>
              Управление предметами
            </Button>
            <Button onClick={() => setIsSlotFormOpen(true)}>
              Добавить урок
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Контролируйте учебную неделю: добавляйте предметы и уроки,
          редактируйте слоты и следите за нагрузкой по дням.
        </p>
      </header>

      {error && (
        <p className="border-destructive/50 bg-destructive/10 rounded-lg border p-3 text-sm">
          {error}
        </p>
      )}
      {isLoading && (
        <p className="text-muted-foreground">Загружаем расписание…</p>
      )}

      <ScheduleGrid
        onDaySelect={(day) => setSelectedDay(day)}
        onDelete={(id) => void deleteSlot(id)}
        onEdit={(slot) => {
          setEditingSlot(slot);
          setIsSlotFormOpen(true);
        }}
        schedule={schedule}
        selectedDay={activeDay}
        subjects={subjects}
      />

      <ScheduleForm
        initialSlot={editingSlot}
        isOpen={isSlotFormOpen}
        onClose={() => {
          setIsSlotFormOpen(false);
          setEditingSlot(undefined);
        }}
        onSubmit={handleSubmitSlot}
        onDeleteSubject={deleteSubject}
        schedule={schedule}
        subjects={subjects}
      />

      <SubjectManager
        isOpen={isSubjectsOpen}
        onClose={() => setIsSubjectsOpen(false)}
        onCreate={(name, color) => createSubject({ name, color })}
        onDelete={(id) => deleteSubject(id)}
        onUpdate={(id, name, color) => updateSubject(id, { name, color })}
        subjects={subjects}
      />
    </main>
  )
}
