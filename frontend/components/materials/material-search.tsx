"use client";

import { useEffect, useState } from "react";

interface MaterialSearchProps {
  onSearch: (query: string, subject?: string) => void;
  subjects: string[];
  loading: boolean;
}

export function MaterialSearch({ onSearch, subjects, loading }: MaterialSearchProps) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onSearch(query.trim(), subject || undefined);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query, subject, onSearch]);

  const handleSubmit = () => {
    if (!query.trim()) {
      return;
    }

    onSearch(query.trim(), subject || undefined);
  };

  return (
    <section className="grid gap-3 md:grid-cols-[1fr_220px_auto]" aria-label="Форма поиска материалов">
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        Поиск материалов
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary/40 transition focus-visible:ring-2"
          placeholder="Например: квадратные уравнения"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        Предмет
        <select
          aria-label="Предмет"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none ring-primary/40 transition focus-visible:ring-2"
        >
          <option value="">Все предметы</option>
          {subjects.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:self-end"
      >
        Найти
      </button>
    </section>
  );
}
