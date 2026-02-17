import { IconBolt, IconChartBar, IconChecklist } from "@tabler/icons-react";

const dashboardCards = [
  {
    title: "Ближайшая домашка",
    value: "Алгебра — до 18:00",
    description: "Осталось 2 задачи и проверка ответов.",
  },
  {
    title: "Сегодня по расписанию",
    value: "6 уроков",
    description: "Физика, литература, информатика и другие.",
  },
  {
    title: "Предупреждения",
    value: "1 риск",
    description: "Контрольная по биологии уже завтра.",
  },
];

const quickActions = [
  { label: "Добавить новое ДЗ", Icon: IconChecklist },
  { label: "Поставить напоминание", Icon: IconBolt },
  { label: "Проверить нагрузку недели", Icon: IconChartBar },
];

export default function Home() {
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
        <article className="border-primary/30 rounded-3xl border bg-card p-6">
          <p className="text-sm font-semibold">Фокус дня</p>
          <h3 className="mt-2 text-2xl font-black">Подготовка к контрольной</h3>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Разбей повторение на три блока по 20 минут и добавь паузы. Так проще
            держать концентрацию и не перегружаться.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-card p-6">
          <h3 className="text-lg font-bold">Быстрые действия</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {quickActions.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={16} className="text-primary" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {dashboardCards.map((card) => (
          <article
            key={card.title}
            className="flex h-full min-h-36 flex-col rounded-2xl border border-border/70 bg-card p-4"
          >
            <p className="text-muted-foreground text-xs">{card.title}</p>
            <p className="mt-2 text-xl font-bold">{card.value}</p>
            <p className="text-muted-foreground mt-auto pt-2 text-sm">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
