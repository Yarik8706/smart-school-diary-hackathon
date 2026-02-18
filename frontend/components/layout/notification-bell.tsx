"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconBell } from "@tabler/icons-react";

import { api } from "@/lib/api-client";
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let active = true;

    const loadReminders = async () => {
      try {
        setError(null);
        const payload = await api.get<PendingRemindersResponse>(
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

  const panel = (
    <section
      id="pending-reminders"
      className={cn(
        "border-border/70 bg-popover fixed top-20 right-4 z-[120] mt-3 w-72 rounded-2xl border p-3 shadow-lg md:right-8",
        isOpen ? "block" : "hidden",
      )}
    >
      <h2 className="mb-2 text-sm font-semibold">Непрочитанные напоминания</h2>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
      <ul className="max-h-56 space-y-2 overflow-auto">
        {items.length === 0 ? (
          <li className="text-muted-foreground bg-muted/40 rounded-xl p-2 text-xs">
            Пока всё чисто — новых напоминаний нет.
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="bg-muted/40 rounded-xl p-2">
              <p className="text-sm font-medium">{item.title}</p>
              {item.due_at ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.due_at}
                </p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        type="button"
        className="hover:bg-accent border-border/70 relative inline-flex h-10 w-10 items-center justify-center rounded-xl border"
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
      {typeof document !== "undefined"
        ? createPortal(panel, document.body)
        : null}
    </div>
  );
}
