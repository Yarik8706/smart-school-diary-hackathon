from app.routers.homework import router as homework_router
from app.routers.reminders import router as reminders_router
from app.routers.schedule import router as schedule_router
from app.routers.subjects import router as subjects_router

__all__ = ["homework_router", "reminders_router", "schedule_router", "subjects_router"]
