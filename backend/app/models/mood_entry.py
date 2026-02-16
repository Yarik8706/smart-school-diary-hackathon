from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import MoodLevel


class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    homework_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("homeworks.id", ondelete="SET NULL"),
        nullable=True,
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    mood: Mapped[MoodLevel] = mapped_column(
        Enum(MoodLevel, name="mood_level_enum"),
        nullable=False,
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    homework = relationship("Homework", back_populates="mood_entries")
