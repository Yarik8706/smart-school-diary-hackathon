from app.routers.analytics import router as analytics_router
from app.routers.homework import router as homework_router
from app.routers.materials import router as materials_router
from app.routers.mood import router as mood_router
from app.routers.reminders import router as reminders_router
from app.routers.schedule import router as schedule_router
from app.routers.subjects import router as subjects_router

__all__ = [
    "analytics_router",
    "homework_router",
    "materials_router",
    "mood_router",
    "reminders_router",
    "schedule_router",
    "subjects_router",
]
