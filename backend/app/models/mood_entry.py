from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import DifficultyLevel


class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    homework_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("homeworks.id", ondelete="SET NULL"), nullable=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    mood: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel, name="mood_level", values_callable=lambda enum_cls: [item.value for item in enum_cls]), nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    homework = relationship("Homework", back_populates="mood_entries")
