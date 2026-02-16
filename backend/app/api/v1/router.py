from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.schedule import router as schedule_router
from app.api.v1.subjects import router as subjects_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(health_router)
api_router.include_router(subjects_router)
api_router.include_router(schedule_router)
