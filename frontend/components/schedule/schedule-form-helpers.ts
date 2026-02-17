import type {
  ScheduleSlot,
  ScheduleSlotCreate,
  Subject,
} from "@/types/schedule";

export const buildInitialSlotValues = (
  initialSlot: ScheduleSlot | undefined,
  subjects: Subject[],
): ScheduleSlotCreate => ({
  subject_id: initialSlot?.subject_id ?? subjects[0]?.id ?? "",
  day_of_week: initialSlot?.day_of_week ?? 1,
  start_time: initialSlot?.start_time ?? "08:00",
  end_time: initialSlot?.end_time ?? "08:45",
  classroom: initialSlot?.classroom ?? "",
});

export const hasSlotOverlap = (
  payload: ScheduleSlotCreate,
  schedule: ScheduleSlot[],
  currentId?: string,
) =>
  schedule.some((slot) => {
    if (slot.day_of_week !== payload.day_of_week || slot.id === currentId) {
      return false;
    }
    return (
      payload.start_time < slot.end_time && payload.end_time > slot.start_time
    );
  });
