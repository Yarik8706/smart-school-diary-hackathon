"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navigationItems } from "./navigation-config";

const mobileItems = navigationItems.slice(0, 5);

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-border/70 bg-card/95 px-2 py-2 backdrop-blur md:hidden"
      aria-label="Мобильная навигация"
    >
      <ul className="grid grid-cols-5 gap-1">
        {mobileItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center rounded-xl text-[11px] font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="mb-1 h-5 w-5" stroke={1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
