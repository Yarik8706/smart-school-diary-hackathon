"use client";

import { useCallback } from "react";

import { MaterialList } from "@/components/materials/material-list";
import { MaterialSearch } from "@/components/materials/material-search";
import { useMaterialStore } from "@/store/materials";

const subjects = ["math", "physics", "chemistry", "history"];

export function MaterialsPageClient() {
  const { materials, loading, error, searchMaterials } = useMaterialStore();

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
      <MaterialList materials={materials} />
    </section>
  );
}
