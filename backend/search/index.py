import json
import os
import urllib.request
import urllib.error

SITE_CONTEXT = """
Ты — умный AI-помощник поисковой системы сайта. Сайт называется "Цифровое будущее" — это современная digital-студия/SaaS-компания.

На сайте есть следующие разделы:
1. Главная — общее описание компании, призывы к действию "Обсудить проект" и "Наши услуги"
2. Работы (Портфолио) — примеры выполненных проектов
3. Услуги — перечень услуг студии (веб-разработка, дизайн, SaaS, digital-продукты)
4. О нас — информация о команде и компании
5. Контакты — форма обратной связи, контактные данные

Компания создаёт современные веб-приложения и цифровые продукты, которые помогают бизнесу расти.

На вопросы пользователей отвечай кратко (2-4 предложения), по делу, на русском языке. 
Если вопрос связан с разделом сайта — укажи в какой раздел перейти.
Если не знаешь ответа — честно скажи и предложи написать в контакты.
"""


def handler(event: dict, context) -> dict:
    """GPT-поиск по содержимому сайта"""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Method not allowed"}),
        }

    body = json.loads(event.get("body") or "{}")
    query = body.get("query", "").strip()

    if not query:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Query is required"}),
        }

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "OpenAI API key not configured"}),
        }

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SITE_CONTEXT},
            {"role": "user", "content": query},
        ],
        "max_tokens": 300,
        "temperature": 0.7,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read())

    answer = result["choices"][0]["message"]["content"]

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"answer": answer, "query": query}),
    }
