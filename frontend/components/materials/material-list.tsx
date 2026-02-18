import { MaterialCard } from "@/components/materials/material-card";
import type { Material } from "@/types/materials";

interface MaterialListProps {
  materials: Material[];
}

export function MaterialList({ materials }: MaterialListProps) {
  if (!materials.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm font-medium text-muted-foreground">
        Ничего не найдено
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Результаты поиска">
      {materials.map((material) => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </section>
  );
}
