from __future__ import annotations

from app.services import load_analyzer


def test_build_day_analysis_calculates_high_load_and_warning() -> None:
    lessons = [
        load_analyzer.LessonLoad(day=1, subject_name="Math", hard_count=3),
        load_analyzer.LessonLoad(day=1, subject_name="Physics", hard_count=2),
        load_analyzer.LessonLoad(day=1, subject_name="Chemistry", hard_count=2),
        load_analyzer.LessonLoad(day=1, subject_name="History", hard_count=0),
    ]

    analysis = load_analyzer.build_day_analysis(day=1, lessons=lessons)

    assert analysis.lessons_count == 4
    assert analysis.load_score == 11
    assert set(analysis.hard_subjects) == {"Math", "Physics", "Chemistry"}
    assert analysis.warning is not None


def test_build_day_analysis_handles_empty_day() -> None:
    analysis = load_analyzer.build_day_analysis(day=4, lessons=[])

    assert analysis.load_score == 0
    assert analysis.lessons_count == 0
    assert analysis.hard_subjects == []
    assert analysis.warning is None
