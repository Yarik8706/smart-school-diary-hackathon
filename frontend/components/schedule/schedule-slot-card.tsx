import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSubjectColorClass } from "@/components/schedule/constants";
import type { ScheduleSlot, Subject } from "@/types/schedule";

interface ScheduleSlotCardProps {
  slot: ScheduleSlot;
  subject?: Subject;
  onEdit: (slot: ScheduleSlot) => void;
  onDelete: (id: string) => void;
}

export default function ScheduleSlotCard({
  slot,
  subject,
  onEdit,
  onDelete,
}: ScheduleSlotCardProps) {
  return (
    <article className="bg-card focus-within:ring-ring flex h-full min-h-28 flex-col rounded-lg border p-3 shadow-sm focus-within:ring-2">
      <div className="mb-2 flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "h-10 w-1.5 rounded-full",
            getSubjectColorClass(subject?.color),
          )}
        />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            {subject?.name ?? "Без предмета"}
          </h3>
          <p className="text-muted-foreground text-xs">
            {slot.start_time} - {slot.end_time}
          </p>
          <p className="text-xs">Кабинет: {slot.classroom}</p>
        </div>
      </div>
      <div className="mt-auto flex gap-2">
        <Button
          className="flex-1"
          size="sm"
          variant="outline"
          onClick={() => onEdit(slot)}
        >
          Редактировать
        </Button>
        <Button
          className="flex-1"
          size="sm"
          variant="destructive"
          onClick={() => onDelete(slot.id)}
        >
          Удалить
        </Button>
      </div>
    </article>
  );
}
