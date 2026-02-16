"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";

export default function ProjectHealth() {
  const isReady = useAppStore((state) => state.isReady);
  const setIsReady = useAppStore((state) => state.setIsReady);

  useEffect(() => {
    gsap.fromTo(
      ".project-health",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
    );
  }, []);

  return (
    <section className="project-health bg-card text-card-foreground rounded-2xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Frontend bootstrap ready</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Next.js, Tailwind, shadcn/ui, Zustand and GSAP are configured.
      </p>
      <Button className="mt-4" onClick={() => setIsReady(!isReady)}>
        Zustand status: {isReady ? "Ready" : "Not ready"}
      </Button>
    </section>
  );
}
