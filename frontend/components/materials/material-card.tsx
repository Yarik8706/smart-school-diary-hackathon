import {
  IconArticle,
  IconBrandYoutube,
  IconWorld,
} from "@tabler/icons-react";

import type { Material } from "@/types/materials";

interface MaterialCardProps {
  material: Material;
}

const sourceMeta = {
  youtube: {
    label: "YouTube",
    icon: IconBrandYoutube,
  },
  article: {
    label: "Article",
    icon: IconArticle,
  },
  website: {
    label: "Website",
    icon: IconWorld,
  },
};

export function MaterialCard({ material }: MaterialCardProps) {
  const meta = sourceMeta[material.source];

  return (
    <article className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      {material.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={material.thumbnail_url}
          alt={`Превью материала ${material.title}`}
          className="h-36 w-full rounded-xl object-cover"
        />
      ) : null}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <meta.icon size={16} aria-hidden="true" />
        <span>{meta.label}</span>
      </div>
      <h3 className="text-base font-extrabold text-foreground">{material.title}</h3>
      {material.description ? (
        <p className="text-sm text-muted-foreground">{material.description}</p>
      ) : null}
      <a
        href={material.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
      >
        Открыть
      </a>
    </article>
  );
}
