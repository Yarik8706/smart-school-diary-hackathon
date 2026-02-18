"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import type { Homework, Subject } from "@/types/homework";

import { HomeworkCard } from "./homework-card";

interface HomeworkListProps {
  homework: Homework[];
  subjects: Subject[];
  generatingById: Record<string, boolean>;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
  onDone: (homework: Homework) => void;
  onGenerateSteps: (id: string) => void;
  onToggleStep: (id: string) => void;
}

export function HomeworkList({
  homework,
  subjects,
  generatingById,
  onEdit,
  onDelete,
  onDone,
  onGenerateSteps,
  onToggleStep,
}: HomeworkListProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    gsap.fromTo(
      rootRef.current.querySelectorAll("[data-homework-card]"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04 },
    );
  }, [homework]);

  if (!homework.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Нет домашних заданий по выбранным фильтрам.
      </p>
    );
  }

  return (
    <div ref={rootRef} className="grid gap-3 md:grid-cols-2">
      {homework.map((item) => (
        <HomeworkCard
          key={item.id}
          homework={item}
          subject={subjects.find((subject) => subject.id === item.subject_id)}
          isGeneratingSteps={Boolean(generatingById[item.id])}
          onEdit={onEdit}
          onDelete={onDelete}
          onDone={onDone}
          onGenerateSteps={onGenerateSteps}
          onToggleStep={onToggleStep}
        />
      ))}
    </div>
  );
}

export default HomeworkList;
