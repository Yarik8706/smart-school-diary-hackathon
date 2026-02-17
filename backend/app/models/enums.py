try:
    from enum import StrEnum
except ImportError:  # pragma: no cover - Python < 3.11 fallback
    from enum import Enum

    class StrEnum(str, Enum):
        pass


class DifficultyLevel(StrEnum):
    EASY = "easy"
    NORMAL = "normal"
    HARD = "hard"
