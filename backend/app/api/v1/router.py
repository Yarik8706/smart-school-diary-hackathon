from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.routers.analytics import router as analytics_router
from app.routers.homework import router as homework_router
from app.routers.materials import router as materials_router
from app.routers.mood import router as mood_router
from app.routers.reminders import router as reminders_router
from app.routers.schedule import router as schedule_router
from app.routers.subjects import router as subjects_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(subjects_router)
api_router.include_router(schedule_router)
api_router.include_router(reminders_router)
api_router.include_router(homework_router)
api_router.include_router(mood_router)
api_router.include_router(analytics_router)
api_router.include_router(materials_router)
