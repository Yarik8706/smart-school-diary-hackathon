"use client";

import { useEffect } from "react";
import { IconBolt, IconChartBar, IconChecklist } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import { useDashboardStore } from "@/store/dashboard";

const quickActions = [
  { label: "Добавить новое ДЗ", Icon: IconChecklist, href: "/homework" },
  { label: "Поставить напоминание", Icon: IconBolt, href: "/reminders" },
  {
    label: "Проверить нагрузку недели",
    Icon: IconChartBar,
    href: "/analytics",
  },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
  }).format(date);
};

export default function DashboardPageClient() {
  const router = useRouter();
  const { summary, isLoading, error, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
          Дашборд
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">
          Учись спокойно и без дедлайн-паники
        </h2>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
          Здесь собрана ключевая сводка по дню: что сдавать, что учить и где не
          забыть про напоминание.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <article className="border-primary/30 bg-card rounded-3xl border p-6">
          <p className="text-sm font-semibold">Фокус дня</p>
          <h3 className="mt-2 text-2xl font-black">Подготовка к контрольной</h3>
          <p className="text-muted-foreground mt-3 max-w-lg text-sm">
            Разбей повторение на три блока по 20 минут и добавь паузы. Так проще
            держать концентрацию и не перегружаться.
          </p>
        </article>
        <article className="border-border/70 bg-card rounded-3xl border p-6">
          <h3 className="text-lg font-bold">Быстрые действия</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {quickActions.map(({ label, Icon, href }) => (
              <li key={label}>
                <button
                  type="button"
                  className="hover:bg-muted focus-visible:ring-ring flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                  onClick={() => router.push(href)}
                >
                  <Icon size={16} className="text-primary" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="border-border/70 bg-card flex h-full min-h-36 flex-col rounded-2xl border p-4">
          <p className="text-muted-foreground text-xs">Ближайшая домашка</p>
          <p className="mt-2 text-xl font-bold">
            {isLoading
              ? "Загрузка..."
              : (summary.nearestHomework?.title ?? "Нет активных заданий")}
          </p>
          <p className="text-muted-foreground mt-auto pt-2 text-sm">
            {summary.nearestHomework
              ? `${formatDate(summary.nearestHomework.deadline)} · ${summary.nearestHomework.remaining}`
              : "Можно посвятить время повторению."}
          </p>
        </article>

        <article className="border-border/70 bg-card flex h-full min-h-36 flex-col rounded-2xl border p-4">
          <p className="text-muted-foreground text-xs">Сегодня по расписанию</p>
          <p className="mt-2 text-xl font-bold">
            {isLoading ? "Загрузка..." : `${summary.todayLessons.count} уроков`}
          </p>
          <p className="text-muted-foreground mt-auto pt-2 text-sm">
            {summary.todayLessons.subjects.length > 0
              ? summary.todayLessons.subjects.join(", ")
              : "Свободное окно для самостоятельной подготовки."}
          </p>
        </article>

        <article className="border-border/70 bg-card flex h-full min-h-36 flex-col rounded-2xl border p-4">
          <p className="text-muted-foreground text-xs">Предупреждения</p>
          <p className="mt-2 text-xl font-bold">
            {isLoading ? "Загрузка..." : `${summary.warnings.count} риск(а)`}
          </p>
          <p className="text-muted-foreground mt-auto pt-2 text-sm">
            {summary.warnings.description}
          </p>
        </article>
      </div>
    </section>
  );
}
