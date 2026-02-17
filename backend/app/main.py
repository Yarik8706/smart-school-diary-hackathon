from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

OPENAPI_TAGS = [
    {"name": "subjects", "description": "Операции с учебными предметами"},
    {"name": "schedule", "description": "Управление расписанием занятий"},
    {"name": "homework", "description": "Работа с домашними заданиями"},
    {"name": "reminders", "description": "Планирование напоминаний по дедлайнам"},
    {"name": "mood", "description": "Трекер сложности и настроения по заданиям"},
    {"name": "analytics", "description": "Аналитика учебной нагрузки"},
    {"name": "materials", "description": "Образовательные материалы и контент"},
]

app = FastAPI(
    title="Smart School Diary API",
    description="API для умного школьного дневника",
    version="1.0.0",
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
