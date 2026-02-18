export const WEEK_DAYS = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
] as const;

export const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export const SUBJECT_COLORS = [
  { value: "blue", label: "Синий", className: "bg-blue-500" },
  { value: "violet", label: "Фиолетовый", className: "bg-violet-500" },
  { value: "green", label: "Зелёный", className: "bg-green-500" },
  { value: "amber", label: "Янтарный", className: "bg-amber-500" },
  { value: "rose", label: "Розовый", className: "bg-rose-500" },
  { value: "cyan", label: "Голубой", className: "bg-cyan-500" },
  { value: "red", label: "Красный", className: "bg-red-500" },
  { value: "orange", label: "Оранжевый", className: "bg-orange-500" },
  { value: "yellow", label: "Жёлтый", className: "bg-yellow-500" },
  { value: "emerald", label: "Изумрудный", className: "bg-emerald-500" },
  { value: "teal", label: "Бирюзовый", className: "bg-teal-500" },
  { value: "indigo", label: "Индиго", className: "bg-indigo-500" },
  { value: "pink", label: "Малиновый", className: "bg-pink-500" },
  { value: "slate", label: "Серый", className: "bg-slate-500" },
] as const;

export const getSubjectColorClass = (color?: string) => {
  const selectedColor = SUBJECT_COLORS.find((item) => item.value === color);
  return selectedColor?.className ?? "bg-blue-500";
};
