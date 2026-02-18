# Реализация ИИ-агента с OpenRouter + Gemini  
(структурированный вывод, tool calling, поиск в интернете, изображения и др.)

Дата актуальности описанных возможностей: февраль 2026

## 1. Базовое подключение к OpenRouter (OpenAI-совместимый клиент)

```python
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)
```

Популярные модели Gemini на OpenRouter (2026):
- `google/gemini-2.5-flash`
- `google/gemini-2.5-pro`
- `google/gemini-3-flash-preview`
- `google/gemini-3-pro-preview`

## 2. Обычный текстовый чат

```python
response = client.chat.completions.create(
    model="google/gemini-2.5-flash",
    messages=[
        {"role": "system", "content": "Ты краткий помощник."},
        {"role": "user", "content": "Привет"}
    ],
    max_tokens=200,
    temperature=0.7
)

print(response.choices[0].message.content)
```

## 3. Принудительный JSON-вывод (structured output)

Вариант 1 — простой json_object (самый надёжный)

```python
response = client.chat.completions.create(
    model="google/gemini-2.5-flash",
    messages=[...],
    response_format={"type": "json_object"},
    temperature=0.5
)

content = response.choices[0].message.content
data = json.loads(content)
```

Вариант 2 — строгий JSON Schema (более жёсткий контроль)

```python
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "person_info",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "age": {"type": "integer"},
                "skills": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["name", "age"],
            "additionalProperties": False
        }
    }
}

response = client.chat.completions.create(..., response_format=response_format)
```

## 4. Вызов инструментов (tool / function calling)

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Получить погоду",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"},
                    "unit": {"type": "string", "enum": ["c", "f"]}
                },
                "required": ["city"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="google/gemini-2.5-pro",
    messages=[{"role": "user", "content": "Погода в Киеве?"}],
    tools=tools,
    tool_choice="auto"          # или "required"
)

if response.choices[0].message.tool_calls:
    for call in response.choices[0].message.tool_calls:
        print(call.function.name)
        print(json.loads(call.function.arguments))
```

**Важно для Gemini**:  
Если модель возвращает `reasoning_details` → сохраняйте их и передавайте в следующих сообщениях (иначе ошибка 400 при multi-turn tool use).

## 5. Реализация ReAct-цикла (агент с поиском в интернете)

```python
def agent_loop(user_query: str, max_steps=5):
    messages = [{"role": "user", "content": user_query}]
    history = []

    for step in range(max_steps):
        resp = client.chat.completions.create(
            model="google/gemini-2.5-pro",
            messages=messages,
            tools=tools,                    # ваш набор инструментов
            tool_choice="auto"
        )

        msg = resp.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            # финальный ответ
            return msg.content

        # выполняем все вызванные инструменты
        for tool_call in msg.tool_calls:
            func_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            if func_name == "web_search":
                # здесь ваш реальный вызов поисковика
                result = your_web_search_function(**args)
            elif func_name == "get_weather":
                result = {"temperature": 15, "condition": "cloudy"}
            else:
                result = {"error": "unknown tool"}

            # добавляем результат обратно
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": func_name,
                "content": json.dumps(result, ensure_ascii=False)
            })

    return "Достигнут лимит шагов"
```

## 6. Полный список часто используемых возможностей (2026)

| Возможность                  | Поддержка в Gemini через OpenRouter | Рекомендуемая модель              | Примечание                              |
|------------------------------|--------------------------------------|------------------------------------|------------------------------------------|
| Обычный текст                | да                                   | все                                | —                                        |
| JSON mode (json_object)      | да                                   | все                                | надёжно                                  |
| Structured Output (json_schema) | да                                | 2.5-pro, 3.x                       | иногда теряет strictness                 |
| Tool calling                 | да                                   | 2.5-flash/pro, 3.x                 | лучше с reasoning_details в multi-turn   |
| Vision (анализ картинок)     | да                                   | gemini-2.5-flash-vision и выше    | base64 или url в content                 |
| Многошаговый ReAct-агент     | да                                   | 2.5-pro / 3-pro-preview            | сохранять reasoning_details              |
| Длинный контекст             | до 1M токенов                        | gemini-2.5-pro / 3.x               | реально ~200–400k в OpenRouter           |

## 7. Полезные заголовки (для рейтинга и отладки)

```python
extra_headers={
    "HTTP-Referer": "https://your-project.com",
    "X-Title": "My Gemini Agent v1.0"
}
```

## Заключение

Наиболее стабильный стек на февраль 2026 для агента с поиском и инструментами:

- Модель: `google/gemini-2.5-pro` или `google/gemini-3-flash-preview`
- JSON: `response_format={"type": "json_object"}` (или schema при необходимости)
- Tool calling: `tool_choice="auto"` + обработка `reasoning_details`
- ReAct-цикл: 4–8 итераций максимум
