"use client";

import NotificationBell from "./notification-bell";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="border-border/70 bg-card/80 relative z-40 mb-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
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
