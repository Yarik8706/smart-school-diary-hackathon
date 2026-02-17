from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import DifficultyLevel
from app.models.homework import Homework
from app.models.mood_entry import MoodEntry
from app.models.schedule_slot import ScheduleSlot
from app.models.subject import Subject
from app.schemas.analytics import DayLoadAnalysis, WeekLoadAnalysis

HARD_SUBJECT_THRESHOLD = 2
HIGH_LOAD_THRESHOLD = 8


@dataclass
class LessonLoad:
    day: int
    subject_name: str
    hard_count: int


async def _fetch_lessons_with_hardness(db: AsyncSession, day: int | None = None) -> list[LessonLoad]:
    hard_counts_subquery = (
        select(Homework.subject_id.label("subject_id"), func.count(MoodEntry.id).label("hard_count"))
        .join(MoodEntry, MoodEntry.homework_id == Homework.id)
        .where(MoodEntry.mood == DifficultyLevel.HARD)
        .group_by(Homework.subject_id)
        .subquery()
    )

    query: Select[tuple[int, str, int]] = (
        select(
            ScheduleSlot.day_of_week,
            Subject.name,
            func.coalesce(hard_counts_subquery.c.hard_count, 0),
        )
        .join(Subject, Subject.id == ScheduleSlot.subject_id)
        .outerjoin(hard_counts_subquery, hard_counts_subquery.c.subject_id == Subject.id)
        .order_by(ScheduleSlot.day_of_week, ScheduleSlot.start_time)
    )

    if day is not None:
        query = query.where(ScheduleSlot.day_of_week == day)

    result = await db.execute(query)
    return [LessonLoad(day=row[0], subject_name=row[1], hard_count=row[2]) for row in result.all()]


def build_day_analysis(day: int, lessons: list[LessonLoad]) -> DayLoadAnalysis:
    lessons_count = len(lessons)
    hard_score = sum(lesson.hard_count for lesson in lessons)
    load_score = lessons_count + hard_score

    subject_hardness: dict[str, int] = {}
    for lesson in lessons:
        subject_hardness[lesson.subject_name] = max(subject_hardness.get(lesson.subject_name, 0), lesson.hard_count)

    hard_subjects = sorted(
        [subject_name for subject_name, hard_count in subject_hardness.items() if hard_count >= HARD_SUBJECT_THRESHOLD]
    )

    warnings: list[str] = []
    if load_score >= HIGH_LOAD_THRESHOLD:
        warnings.append("Высокая нагрузка")
    if len(hard_subjects) >= 3:
        warnings.append("3 или более сложных предметов в один день")

    warning_text = "; ".join(warnings) if warnings else None
    return DayLoadAnalysis(
        day=day,
        load_score=load_score,
        lessons_count=lessons_count,
        hard_subjects=hard_subjects,
        warning=warning_text,
    )


async def analyze_day_load(db: AsyncSession, day: int) -> DayLoadAnalysis:
    lessons = await _fetch_lessons_with_hardness(db, day=day)
    return build_day_analysis(day=day, lessons=lessons)


async def analyze_week_load(db: AsyncSession) -> WeekLoadAnalysis:
    lessons = await _fetch_lessons_with_hardness(db)
    lessons_by_day: dict[int, list[LessonLoad]] = {day: [] for day in range(7)}
    for lesson in lessons:
        lessons_by_day[lesson.day].append(lesson)

    days = [build_day_analysis(day=day, lessons=lessons_by_day[day]) for day in range(7)]
    return WeekLoadAnalysis(days=days)


async def get_overload_warnings(db: AsyncSession) -> list[str]:
    week_analysis = await analyze_week_load(db)
    warnings: list[str] = []
    for day_analysis in week_analysis.days:
        if day_analysis.warning is not None:
            warnings.append(f"День {day_analysis.day}: {day_analysis.warning}")
    return warnings
