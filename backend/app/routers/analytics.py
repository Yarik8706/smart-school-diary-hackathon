from __future__ import annotations

from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.analytics import DayLoadAnalysis, LoadWarningsResponse, WeekLoadAnalysis
from app.services import load_analyzer

router = APIRouter(prefix="/v1/analytics", tags=["analytics"])


@router.get("/load", response_model=WeekLoadAnalysis)
async def get_week_load(db: AsyncSession = Depends(get_db)) -> WeekLoadAnalysis:
    return await load_analyzer.analyze_week_load(db)


@router.get("/load/{day}", response_model=DayLoadAnalysis)
async def get_day_load(day: int = Path(ge=0, le=6), db: AsyncSession = Depends(get_db)) -> DayLoadAnalysis:
    return await load_analyzer.analyze_day_load(db, day)


@router.get("/warnings", response_model=LoadWarningsResponse)
async def get_warnings(db: AsyncSession = Depends(get_db)) -> LoadWarningsResponse:
    warnings = await load_analyzer.get_overload_warnings(db)
    return LoadWarningsResponse(warnings=warnings)
