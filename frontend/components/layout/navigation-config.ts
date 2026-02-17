import {
  IconBell,
  IconBook,
  IconCalendarEvent,
  IconChartBar,
  IconHome,
  IconSearch,
} from "@tabler/icons-react";

import type { ComponentType } from "react";

export interface NavigationItem {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string; stroke?: number }>;
}

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "Главная", Icon: IconHome },
  { href: "/schedule", label: "Расписание", Icon: IconCalendarEvent },
  { href: "/homework", label: "Домашка", Icon: IconBook },
  { href: "/reminders", label: "Напоминания", Icon: IconBell },
  { href: "/analytics", label: "Аналитика", Icon: IconChartBar },
  { href: "/materials", label: "Материалы", Icon: IconSearch },
];

export const pageTitles: Record<string, string> = {
  "/": "Главная",
  "/schedule": "Расписание",
  "/homework": "Домашние задания",
  "/reminders": "Напоминания",
  "/analytics": "Аналитика",
  "/materials": "Материалы",
};
