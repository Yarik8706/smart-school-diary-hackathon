import type { ReminderView } from "@/types/reminders";

import { groupReminders } from "./reminder-utils";
import { ReminderCard } from "./reminder-card";

interface ReminderListProps {
  reminders: ReminderView[];
  onEdit: (reminder: ReminderView) => void;
  onDelete: (id: string) => void;
}

export function ReminderList({
  reminders,
  onEdit,
  onDelete,
}: ReminderListProps) {
  const groups = groupReminders(reminders);

  if (!groups.length) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
        Напоминаний пока нет.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key} className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
            {group.title}
          </h3>
          <div className="space-y-3">
            {group.items.map((item) => (
              <ReminderCard
                key={item.id}
                reminder={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default ReminderList;
