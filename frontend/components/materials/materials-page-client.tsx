"use client";

import { useCallback } from "react";

import { IconBulb } from "@tabler/icons-react";

import { MaterialList } from "@/components/materials/material-list";
import { MaterialSearch } from "@/components/materials/material-search";
import { useMaterialStore } from "@/store/materials";

const subjects = ["math", "physics", "chemistry", "history"];

export function MaterialsPageClient() {
  const { materials, recommendation, loading, error, searchMaterials } = useMaterialStore();

  const handleSearch = useCallback(
    (query: string, subject?: string) => {
      void searchMaterials(query, subject);
    },
    [searchMaterials],
  );

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h2 className="text-3xl font-black">Поиск материалов</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Ищи полезные статьи и видео по теме или подбирай контент к домашнему
          заданию.
        </p>
      </header>
      <MaterialSearch onSearch={handleSearch} subjects={subjects} loading={loading} />
      {error ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      {recommendation ? (
        <article className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <header className="mb-2 flex items-center gap-2 text-sm font-bold">
            <IconBulb size={18} aria-hidden="true" />
            <span>AI-рекомендация</span>
          </header>
          <p className="text-sm text-foreground">{recommendation}</p>
        </article>
      ) : null}
      <MaterialList materials={materials} />
    </section>
  );
}
