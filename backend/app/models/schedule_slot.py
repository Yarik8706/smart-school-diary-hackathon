from __future__ import annotations

import uuid
from datetime import time

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import TimestampedUUIDModel


class ScheduleSlot(TimestampedUUIDModel):
    __tablename__ = "schedule_slots"
    __table_args__ = (CheckConstraint("day_of_week BETWEEN 0 AND 6", name="valid_day_of_week"),)

    subject_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    room: Mapped[str | None] = mapped_column(String(32), nullable=True)

    subject = relationship("Subject", back_populates="schedule_slots")
