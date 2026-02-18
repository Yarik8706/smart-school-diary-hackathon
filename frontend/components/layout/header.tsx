"use client";

import { IconMenu2 } from "@tabler/icons-react";

import NotificationBell from "./notification-bell";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="border-border/70 bg-card/80 relative z-30 mb-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hover:bg-accent border-border/70 inline-flex h-10 w-10 items-center justify-center rounded-xl border md:hidden"
          aria-label="Открыть навигацию"
        >
          <IconMenu2 className="h-5 w-5" stroke={1.9} />
        </button>
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">
            Smart School Diary
          </p>
          <h1 className="text-lg font-black tracking-tight sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
      </div>
    </header>
  );
}
