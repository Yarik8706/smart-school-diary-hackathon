"use client";

import { useEffect, useMemo, useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { useHomeworkStore } from "@/store/homework";
import type { Homework, HomeworkFiltersState } from "@/types/homework";

import { HomeworkEditModal } from "./homework-edit-modal";
import { HomeworkFilters } from "./homework-filters";
import { HomeworkList } from "./homework-list";
import { MoodPicker } from "./mood-picker";
import { filterHomework, sortByDeadline } from "./homework-utils";

const defaultFilters: HomeworkFiltersState = {
  subject: "all",
  status: "all",
  deadline: "all",
};

export function HomeworkPageClient() {
  const homework = useHomeworkStore((state) => state.homework);
  const subjects = useHomeworkStore((state) => state.subjects);
  const isLoading = useHomeworkStore((state) => state.isLoading);
  const error = useHomeworkStore((state) => state.error);
  const generatingById = useHomeworkStore(
    (state) => state.isGeneratingByHomeworkId,
  );
  const fetchHomework = useHomeworkStore((state) => state.fetchHomework);
  const fetchSubjects = useHomeworkStore((state) => state.fetchSubjects);
  const addHomework = useHomeworkStore((state) => state.addHomework);
  const updateHomework = useHomeworkStore((state) => state.updateHomework);
  const deleteHomework = useHomeworkStore((state) => state.deleteHomework);
  const generateSteps = useHomeworkStore((state) => state.generateSteps);
  const toggleStep = useHomeworkStore((state) => state.toggleStep);
  const submitMood = useHomeworkStore((state) => state.submitMood);

  const [filters, setFilters] = useState(defaultFilters);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [moodHomework, setMoodHomework] = useState<Homework | null>(null);
  const [isEditOpen, setEditOpen] = useState(false);

  useEffect(() => {
    void Promise.all([fetchHomework(), fetchSubjects()]);
  }, [fetchHomework, fetchSubjects]);

  const items = useMemo(
    () => sortByDeadline(filterHomework(homework, filters)),
    [homework, filters],
  );

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black">Домашние задания</h2>
          <p className="text-muted-foreground text-sm">
            Управляй заданиями, дедлайнами и сложностью в одном месте.
          </p>
        </div>
        <Button onClick={() => setEditOpen(true)}>
          <IconPlus size={18} /> Добавить ДЗ
        </Button>
      </div>
      <HomeworkFilters
        subjects={subjects}
        value={filters}
        onChange={setFilters}
      />
      {error ? (
        <p className="text-destructive rounded-md border border-red-300 p-2 text-sm">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      ) : null}
      <HomeworkList
        homework={items}
        subjects={subjects}
        generatingById={generatingById}
        onEdit={(item) => {
          setEditingHomework(item);
          setEditOpen(true);
        }}
        onDelete={(id) => void deleteHomework(id)}
        onDone={setMoodHomework}
        onGenerateSteps={(id) => void generateSteps(id)}
        onToggleStep={(id) => void toggleStep(id)}
      />
      <HomeworkEditModal
        open={isEditOpen}
        subjects={subjects}
        homework={editingHomework}
        onClose={() => {
          setEditOpen(false);
          setEditingHomework(null);
        }}
        onSubmit={(payload) =>
          editingHomework
            ? updateHomework(editingHomework.id, payload)
            : addHomework(payload)
        }
      />
      <MoodPicker
        open={Boolean(moodHomework)}
        homeworkTitle={moodHomework?.title ?? ""}
        onClose={() => setMoodHomework(null)}
        onSubmit={async (mood, note) => {
          if (!moodHomework?.id) return;
          await submitMood(moodHomework.id, mood, note);
          await deleteHomework(moodHomework.id);
        }}
      />
    </section>
  );
}

export default HomeworkPageClient;
