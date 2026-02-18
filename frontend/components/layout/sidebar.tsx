"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLayoutSidebarLeftCollapse } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { navigationItems } from "./navigation-config";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-border/60 bg-card/80 sticky top-0 hidden h-screen overflow-y-auto border-r px-3 py-4 backdrop-blur-md md:flex md:flex-col",
        collapsed ? "w-20" : "w-72",
      )}
      aria-label="Основная навигация"
    >
      <div className="mb-6 flex items-center justify-between gap-2 px-2">
        <div className={cn("overflow-hidden", collapsed && "sr-only")}>
          <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
            Smart Diary
          </p>
          <h1 className="text-lg font-black">Школьный помощник</h1>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="hover:bg-accent border-border/70 inline-flex h-10 w-10 items-center justify-center rounded-xl border transition"
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <IconLayoutSidebarLeftCollapse
            className={cn("h-5 w-5", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navigationItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex h-12 items-center gap-3 rounded-xl border px-3 text-sm font-semibold transition",
                isActive
                  ? "border-primary/20 bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent border-transparent",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" stroke={1.8} />
              <span className={cn(collapsed && "sr-only")}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
