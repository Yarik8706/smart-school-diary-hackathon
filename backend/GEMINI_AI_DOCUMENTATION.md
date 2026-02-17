# Использование Gemini 3.x с Tools + Structured Output (JSON Schema)

**Дата актуальности**: февраль 2026  
**Модели**: gemini-3-flash-preview, gemini-3-pro-preview (и stable-версии, если вышли)  
**SDK**: Google Generative AI SDK (Python, Node.js и др.)  
**Основной источник**: https://ai.google.dev/gemini-api/docs/structured-output

## Краткий статус на февраль 2026

Gemini 3.x (начиная с preview-версий) **позволяет** одновременно использовать:

- встроенные инструменты (Google Search, URL Context, Code Execution, File Search)
- пользовательские function calling (tools с function_declarations)
- structured output (`response_mime_type="application/json"` + `response_schema` / `response_json_schema`)

Это ключевое улучшение по сравнению с Gemini 2.5 и более ранними моделями, где tools и response_schema часто конфликтовали.

## Поддерживаемые комбинации

| Комбинация                                 | gemini-3-flash-preview | gemini-3-pro-preview | Примечание                              |
|--------------------------------------------|------------------------|----------------------|-----------------------------------------|
| Tools + response_schema (JSON)             | Да                     | Да                   | Основной сценарий 2026 года             |
| Google Search + structured output          | Да                     | Да                   | Работает стабильно                      |
| File Search + structured output            | Да                     | Да                   | Поддерживается с конца 2025             |
| Custom function calling + structured output| Да                     | Да                   | Модель возвращает и tool call, и JSON   |
| response_schema без tools                  | Да                     | Да                   | Работает на всех моделях с 2.0+         |

## Установка SDK (Python)

```bash
pip install --upgrade google-generativeai
```

## Минимальный пример (Python) — Google Search + Structured Output

```python
import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

os.environ["GEMINI_API_KEY"] = "your-api-key"

# Определяем желаемую структуру ответа
class SearchResult(BaseModel):
    query: str = Field(description="Оригинальный поисковый запрос")
    summary: str = Field(description="Краткое резюме на основе поиска")
    confidence: float = Field(ge=0, le=1, description="Уверенность модели в ответе")
    sources: list[str] = Field(default_factory=list, description="Ссылки на источники")

model = genai.GenerativeModel(
    model_name="gemini-3-flash-preview",   # или gemini-3-pro-preview
)

response = model.generate_content(
    "Найди актуальный курс EUR к USD на сегодня и объясни тенденцию за неделю",
    
    generation_config=types.GenerationConfig(
        response_mime_type="application/json",
        response_schema=SearchResult.model_json_schema(),   # ← главное
        temperature=0.2,
    ),
    
    tools=[
        types.Tool(google_search=types.GoogleSearch()),
        # можно добавить другие: url_context, code_execution и т.д.
    ],
)

# Ответ уже будет валидным JSON, соответствующим схеме
print(response.text)
# Пример вывода:
# {"query":"EUR to USD today and weekly trend","summary":"1 EUR = 1.048 USD ...","confidence":0.92,"sources":["https://...","https://..."]}
```

## Пример с пользовательскими функциями + structured output

```python
class FinalDecision(BaseModel):
    verdict: str = Field(description="yes / no / maybe")
    reasoning: str = Field(description="Обоснование")
    score: int = Field(ge=0, le=100)

tool = types.Tool(
    function_declarations=[
        {
            "name": "get_weather",
            "description": "Получить погоду в городе",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"]
            }
        }
    ]
)

response = model.generate_content(
    "Стоит ли завтра брать зонт в Москве?",
    tools=[tool],
    generation_config=types.GenerationConfig(
        response_mime_type="application/json",
        response_schema=FinalDecision.model_json_schema(),
    )
)

print(response.text)
```

## Важные ограничения и нюансы (февраль 2026)

- Не все встроенные инструменты одинаково хорошо работают с response_schema (иногда File Search может откатываться к тексту — проверяйте на конкретной модели).
- Если модель вернула function call вместо JSON → обработайте его классическим способом (выполните → отправьте результат обратно → новый generate_content уже с response_schema).
- `response_schema` vs `response_json_schema` — в новых версиях SDK предпочтительнее `response_json_schema`.
- Температура 0.0–0.3 даёт наиболее предсказуемый JSON.
- Порядок ключей в JSON сохраняется в соответствии со схемой (с ноября 2025).
- Стоимость: structured output + tools увеличивает цену на ~10–30% по сравнению с обычным текстом.

## Рекомендации

1. Всегда используйте Pydantic → `.model_json_schema()` — это самый надёжный способ.
2. Начинайте с `gemini-3-flash-preview` — дешевле и быстрее.
3. Тестируйте на реальных запросах — иногда модель игнорирует схему при очень сложных инструментах.
4. Читайте официальную страницу: https://ai.google.dev/gemini-api/docs/structured-output

