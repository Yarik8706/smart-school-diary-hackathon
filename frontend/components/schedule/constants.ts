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
  { value: "blue", className: "bg-blue-500" },
  { value: "violet", className: "bg-violet-500" },
  { value: "green", className: "bg-green-500" },
  { value: "amber", className: "bg-amber-500" },
  { value: "rose", className: "bg-rose-500" },
  { value: "cyan", className: "bg-cyan-500" },
] as const;

export const getSubjectColorClass = (color?: string) => {
  const selectedColor = SUBJECT_COLORS.find((item) => item.value === color);
  return selectedColor?.className ?? "bg-blue-500";
};
