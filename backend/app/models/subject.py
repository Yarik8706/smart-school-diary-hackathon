from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedUUIDModel


class Subject(TimestampedUUIDModel):
    __tablename__ = "subjects"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)

    schedule_slots = relationship("ScheduleSlot", back_populates="subject", cascade="all, delete-orphan")
    homeworks = relationship("Homework", back_populates="subject", cascade="all, delete-orphan")
