from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedUUIDModel
from app.models.enums import DifficultyRating


class Homework(TimestampedUUIDModel):
    __tablename__ = "homeworks"

    subject_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("subjects.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    difficulty_rating: Mapped[DifficultyRating] = mapped_column(
        Enum(DifficultyRating, name="difficulty_rating_enum"),
        nullable=False,
        default=DifficultyRating.NORMAL,
        server_default=DifficultyRating.NORMAL.value,
    )

    subject = relationship("Subject", back_populates="homeworks")
    steps = relationship("HomeworkStep", back_populates="homework", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="homework", cascade="all, delete-orphan")
    mood_entries = relationship("MoodEntry", back_populates="homework")
