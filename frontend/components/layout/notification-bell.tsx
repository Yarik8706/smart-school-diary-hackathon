"use client";

import { useEffect, useMemo, useState } from "react";
import { IconBell } from "@tabler/icons-react";

import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ReminderItem {
  id: string;
  title: string;
  due_at?: string;
}

interface PendingRemindersResponse {
  reminders?: ReminderItem[];
}

const POLLING_MS = 60_000;

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ReminderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadReminders = async () => {
      try {
        setError(null);
        const payload = await apiClient.get<PendingRemindersResponse>(
          "/api/v1/reminders/pending",
          { cache: "no-store" },
        );
        if (active) {
          setItems(payload.reminders ?? []);
        }
      } catch {
        if (active) {
          setError("Не удалось обновить напоминания");
        }
      }
    };

    void loadReminders();
    const pollId = window.setInterval(loadReminders, POLLING_MS);

    return () => {
      active = false;
      window.clearInterval(pollId);
    };
  }, []);

  const badge = useMemo(() => Math.min(items.length, 99), [items.length]);

  return (
    <div className="relative">
      <button
        type="button"
        className="hover:bg-accent relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="pending-reminders"
        aria-label="Открыть напоминания"
      >
        <IconBell className="h-5 w-5" stroke={1.9} />
        {badge > 0 ? (
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold">
            {badge}
          </span>
        ) : null}
      </button>

      <section
        id="pending-reminders"
        className={cn(
          "absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-border/70 bg-popover p-3 shadow-lg",
          isOpen ? "block" : "hidden",
        )}
      >
        <h2 className="mb-2 text-sm font-semibold">Непрочитанные напоминания</h2>
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
        <ul className="max-h-56 space-y-2 overflow-auto">
          {items.length === 0 ? (
            <li className="text-muted-foreground rounded-xl bg-muted/40 p-2 text-xs">
              Пока всё чисто — новых напоминаний нет.
            </li>
          ) : (
            items.map((item) => (
              <li key={item.id} className="rounded-xl bg-muted/40 p-2">
                <p className="text-sm font-medium">{item.title}</p>
                {item.due_at ? (
                  <p className="text-muted-foreground mt-1 text-xs">{item.due_at}</p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
