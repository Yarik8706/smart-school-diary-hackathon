"use client";

import { WEEK_DAYS } from "@/components/schedule/constants";
import ScheduleSlotCard from "@/components/schedule/schedule-slot-card";
import { Button } from "@/components/ui/button";
import type { ScheduleSlot, Subject } from "@/types/schedule";

interface ScheduleGridProps {
  schedule: ScheduleSlot[];
  subjects: Subject[];
  selectedDay: number;
  onDaySelect: (day: number) => void;
  onEdit: (slot: ScheduleSlot) => void;
  onDelete: (id: string) => void;
}

const byStartTime = (a: ScheduleSlot, b: ScheduleSlot) =>
  a.start_time.localeCompare(b.start_time);

export default function ScheduleGrid({
  schedule,
  subjects,
  selectedDay,
  onDaySelect,
  onEdit,
  onDelete,
}: ScheduleGridProps) {
  const getSlotsByDay = (day: number) =>
    schedule.filter((slot) => slot.day_of_week === day).sort(byStartTime);

  const selectedDaySlots = getSlotsByDay(selectedDay);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2 md:hidden">
        {WEEK_DAYS.map((day) => (
          <Button
            key={day.value}
            size="sm"
            variant={selectedDay === day.value ? "default" : "outline"}
            onClick={() => onDaySelect(day.value)}
          >
            {day.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:hidden">
        {selectedDaySlots.map((slot) => (
          <ScheduleSlotCard
            key={slot.id}
            onDelete={onDelete}
            onEdit={onEdit}
            slot={slot}
            subject={subjects.find((subject) => subject.id === slot.subject_id)}
          />
        ))}
        {!selectedDaySlots.length && (
          <p className="text-muted-foreground">На выбранный день уроков нет.</p>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div className="grid min-w-[980px] grid-cols-5 gap-3">
          {WEEK_DAYS.slice(0, 5).map((day) => {
            const daySlots = getSlotsByDay(day.value);
            return (
              <article
                key={day.value}
                className="bg-card/40 space-y-3 rounded-xl border p-3"
              >
                <h3 className="text-lg font-semibold">{day.label}</h3>
                {daySlots.map((slot) => (
                  <ScheduleSlotCard
                    key={slot.id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    slot={slot}
                    subject={subjects.find(
                      (subject) => subject.id === slot.subject_id,
                    )}
                  />
                ))}
                {!daySlots.length && (
                  <p className="text-muted-foreground text-sm">Нет уроков</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
