from fastapi import APIRouter

router = APIRouter(prefix="/v1/materials", tags=["materials"])


@router.get("", response_model=list[str])
async def list_materials() -> list[str]:
    """
    Получить список рекомендованных учебных материалов.

    Возвращает список ссылок и названий материалов для самостоятельной подготовки.
    """
    return [
        "Алгебра: Базовый курс",
        "История: Ключевые даты и события",
        "Физика: Подготовка к лабораторным",
    ]
