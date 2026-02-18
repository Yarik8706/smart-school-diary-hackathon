"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

import BottomNav from "./bottom-nav";
import Header from "./header";
import { pageTitles } from "./navigation-config";
import Sidebar from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("sidebar-collapsed") === "true";
  });

  const handleToggleSidebar = () => {
    const nextValue = !collapsed;
    setCollapsed(nextValue);
    window.localStorage.setItem("sidebar-collapsed", String(nextValue));
  };

  useLayoutEffect(() => {
    if (!mainRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".shell-enter",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power2.out" },
      );
      gsap.fromTo(
        mainRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power1.out" },
      );
    });

    return () => ctx.revert();
  }, [pathname]);

  const pageTitle = pageTitles[pathname] ?? "Раздел";

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />
      <div className="flex min-h-screen w-full min-w-0 flex-col">
        <main ref={mainRef} className="px-4 py-4 pb-24 md:px-8 md:py-8 md:pb-8">
          <div className="shell-enter">
            <Header title={pageTitle} />
          </div>
          <div className="shell-enter border-border/70 bg-background rounded-3xl border p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
