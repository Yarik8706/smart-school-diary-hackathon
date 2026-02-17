from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.routers.homework import router as homework_router
from app.routers.reminders import router as reminders_router
from app.routers.schedule import router as schedule_router
from app.routers.subjects import router as subjects_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(subjects_router)
api_router.include_router(schedule_router)
api_router.include_router(reminders_router)
api_router.include_router(homework_router)
