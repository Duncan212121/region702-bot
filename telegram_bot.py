"""
Telegram-бот «Агент постов Регион 702»
Версия для БЕСПЛАТНОГО Web Service на Render.

Требования: pip install python-telegram-bot anthropic flask
Переменные окружения: TELEGRAM_TOKEN, ANTHROPIC_KEY

КАК ЭТО РАБОТАЕТ:
Render бесплатно даёт только Web Service (засыпает без HTTP-запросов).
Этот файл запускает Flask-сервер на отдельном потоке — он отвечает "OK"
на любой пинг и не даёт Render усыпить сервис. Сам бот работает в
основном потоке как обычно (polling Telegram).

ВАЖНО: чтобы сервис не засыпал, настрой внешний пинг-сервис
(uptimerobot.com или cron-job.org) — он будет стучаться на твой
Render URL каждые 10 минут. Без этого бот будет засыпать через
15 минут бездействия и просыпаться только при следующем сообщении
(с задержкой 30-60 секунд на "пробуждение").
"""

import os
import logging
import threading
from flask import Flask
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters
)
import anthropic

logging.basicConfig(level=logging.INFO)

TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_KEY"]
PORT = int(os.environ.get("PORT", 10000))  # Render передаёт PORT автоматически

# ─── Flask keep-alive сервер ─────────────────────────────────────────────────

flask_app = Flask(__name__)

@flask_app.route("/")
def home():
    return "Бот Регион 702 работает ✅"

@flask_app.route("/ping")
def ping():
    return "pong"

def run_flask():
    flask_app.run(host="0.0.0.0", port=PORT)

client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# ─── Системный промпт ───────────────────────────────────────────────────────

SYS = """Ты — агент постов Telegram-канала «Регион 702» (region_702rus, Уфа).

КОМПАНИЯ: Частный привоз авто из Китая и Кыргызстана. НЕ автосалон. Прямой экспорт.
Оплата через ВТБ. Официальный договор. Цена «под ключ» = авто + доставка + таможня + СБКТС + ЭПТС + утильсбор.
Постановка на учёт в день сделки. Сроки: 25–45 дней из Китая, 5–7 из Бишкека.

НАШИ АВТО:
✅ Льготный утильсбор (≤160 л.с.): Mazda CX-5/CX-50 (155), KIA Seltos/K3 (115),
Hyundai Elantra (115), Nissan Qashqai/X-Trail (140), Škoda Superb (150),
Audi Q3 (160), VW T-Roc/Tharu (~130), Jetta VS5/VS7/VS8, Honda CR-V, Toyota Levin (116)
⚠️ Коммерческий утильсбор (>160 л.с.): Toyota RAV4 (171), Wildlander (171),
Camry гибрид, Geely Monjaro (272), Tank 300 (220), Changan A06 (электро 286)

КОНЕЦ КАЖДОГО ПОСТА:
📲 +7 937 8 561 566  @aduncan21
Ⓜ️MAX 👈 Мы в Максе
https://region-702.ru

СТИЛЬ: конкретные цифры, сравнение с дилерами/Авито. Без воды.
Отвечай ТОЛЬКО готовым текстом поста. Без вступлений."""

SYS_INFO = """Ты — аналитик авторынка для «Регион 702» (Уфа, частный привоз из Китая).
ТОЛЬКО реальные факты из поиска. НЕ придумывай цифры и даты.
Если данных нет — скажи честно. Аналитический тон.
Конец поста: 📲 +7 937 8 561 566 @aduncan21 / Ⓜ️MAX / https://region-702.ru
Только готовый текст поста."""

# ─── Типы постов ────────────────────────────────────────────────────────────

TYPES = {
    "in_stock":    ("❗️", "Авто в наличии",      "❗️В ПРОДАЖЕ → авто в Уфе, постановка в день сделки → оплата через ВТБ → характеристики → комплектация → утильсбор/СБКТС/ЭПТС → 🔑 цена → «Больше фото на Авито»"),
    "used_order":  ("🔥", "Б/У к заказу",         "🔥 ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ до X руб → характеристики через ▪️ → пробег честный подтверждён → 💰 цена «под ключ» включает ВСЁ → проверен по всем пунктам"),
    "order_new":   ("✅", "Доступен к заказу",     "Название авто ✅ → «проверен и готов к заказу» → характеристики через дефис → комплектация через дефис → region-702.ru → CTA"),
    "delivered":   ("🏆", "Авто вручён",           "Поздравление + цена 🔑 + срок. Если были допработы — перечисли. Благодарим за доверие."),
    "purchased":   ("💪", "Выкуплен / едет",       "Короткий: выкуплен X для Y → сравни с б/у ценой → «успевайте фиксировать цену»"),
    "comparison":  ("📊", "Б/У vs Новый",          "🚗 ЗАЧЕМ ПОКУПАТЬ Б/У ЕСЛИ НОВЫЙ ДЕШЕВЛЕ? → Авито цены б/у → наше предложение нового → комплектация ✅ → итог ✔️"),
    "budget":      ("💰", "За такой бюджет",       "Что предлагают дилеры за эту сумму → список наших авто с флагами, моделями и ценами"),
    "market":      ("💱", "Курс / Рынок",          "Факт → расчёт (X$ × Y₽ = Z₽) → авто в наличии если есть → CTA. Спокойный тон."),
    "story":       ("📖", "История / Кейс",        "❌ Автосалон (цена/срок) → ✅ Регион 702 (цена/срок/белая схема) → итог (экономия в рублях)"),
    "info":        ("📰", "Информационный",        "Поиск актуальных новостей. Только реальные факты. Аналитический тон."),
}

HINTS = {
    "in_stock":   "Напиши характеристики авто:\n\nPример: Toyota RAV4 2.0 CVT 171л.с. AWD 2026, макс. комплект., кожа, панорама, 3 897 000₽",
    "used_order": "Вставь описание б/у авто из Китая:\n\nПример: Toyota Levin 185T 2022, 1.2T 116л.с., CVT, пробег 53 952 км, тёмный салон, 1 500 000₽ под ключ",
    "order_new":  "Вставь характеристики нового авто под заказ:\n\nПример: Lynk&Co 06 2026 Ultra, 1.5T 181л.с., DCT, 2 550 000₽ под ключ до Уфы",
    "delivered":  "Напиши детали выдачи:\n\nПример: Toyota RAV4, клиент Алексей, 2 050 000₽, срок 3 недели",
    "purchased":  "Напиши что выкуплено:\n\nПример: Toyota RAV4 макс. комплект. выкуплен для Марии. Курс даёт возможность — успевайте.",
    "comparison": "Напиши модель для сравнения:\n\nПример: Mazda CX-5 — Авито б/у от 2.75 до 4 млн, наша новая Smart 2.59 млн",
    "budget":     "Напиши бюджет:\n\nПример: 2 500 000₽",
    "market":     "Напиши факт о курсе или рынке:\n\nПример: доллар вырос на 4₽ за 3 дня → RAV4 33 500$ → дороже на 134 000₽",
    "story":      "Опиши ситуацию:\n\nПример: клиентка искала KIA Seltos у дилеров — 2.5 млн и 3 мес. Мы: 2.02 млн и 35-45 дней",
    "info":       "Напиши тему или просто отправь 'темы' и я найду свежие новости:\n\nПример: утильсбор 2026 изменения",
}

# ─── Генерация поста ─────────────────────────────────────────────────────────

def build_prompt(type_id: str, user_text: str) -> str:
    _, label, note = TYPES[type_id]
    data = f"\n\nДанные:\n{user_text}" if user_text.strip() else "\n\n(Создай типовой пост для этой категории)"
    return f"Тип: {TYPES[type_id][0]} {label}\n{note}{data}"

def generate_post(type_id: str, user_text: str) -> str:
    use_search = (type_id == "info")
    sys = SYS_INFO if use_search else SYS
    prompt = build_prompt(type_id, user_text)

    kwargs = dict(
        model="claude-sonnet-4-6",
        max_tokens=1200,
        system=sys,
        messages=[{"role": "user", "content": prompt}],
    )
    if use_search:
        kwargs["tools"] = [{"type": "web_search_20250305", "name": "web_search"}]

    response = client.messages.create(**kwargs)
    return "".join(b.text for b in response.content if hasattr(b, "text")).strip()

# ─── Handlers ────────────────────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton(f"{v[0]} {v[1]}", callback_data=k)]
        for k, v in TYPES.items()
    ]
    await update.message.reply_text(
        "👋 Агент постов Регион 702\n\nВыбери тип поста:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def handle_type(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    type_id = query.data
    context.user_data["type"] = type_id
    icon, label, _ = TYPES[type_id]
    await query.edit_message_text(
        f"{icon} {label}\n\n{HINTS[type_id]}\n\nИли отправь /menu чтобы выбрать другой тип."
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    type_id = context.user_data.get("type", "in_stock")
    icon, label, _ = TYPES[type_id]

    # Если пользователь просит темы для информационного поста
    if text.lower() in ("темы", "новости", "найди темы", "найди новости"):
        context.user_data["type"] = "info"
        await update.message.reply_text("🔍 Ищу свежие темы авторынка...")
        try:
            result = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=600,
                messages=[{"role": "user", "content": f"Найди 4 актуальные темы для постов: курс рубля, утильсбор, импорт из Китая, продажи Mazda/KIA/Nissan/Toyota. Кратко опиши каждую. Формат: нумерованный список 1-4."}],
                tools=[{"type": "web_search_20250305", "name": "web_search"}]
            )
            topics = "".join(b.text for b in result.content if hasattr(b, "text")).strip()
            await update.message.reply_text(
                f"📰 Свежие темы:\n\n{topics}\n\nНапиши номер или тему — напишу пост."
            )
        except Exception as e:
            await update.message.reply_text(f"Ошибка поиска: {e}")
        return

    await update.message.reply_text(f"⏳ Пишу пост «{icon} {label}»...")
    try:
        post = generate_post(type_id, text)
        # Telegram limit: 4096 chars
        if len(post) > 4096:
            post = post[:4090] + "..."
        await update.message.reply_text(post)
        # Suggest next action
        keyboard = [[
            InlineKeyboardButton("🔄 Другой вариант", callback_data=f"regen_{type_id}"),
            InlineKeyboardButton("📋 Сменить тип", callback_data="menu"),
        ]]
        await update.message.reply_text(
            "Скопируй текст выше и добавь фото/видео в Telegram перед публикацией.",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    except Exception as e:
        await update.message.reply_text(f"Ошибка: {e}\n\nПопробуй снова.")

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == "menu":
        keyboard = [
            [InlineKeyboardButton(f"{v[0]} {v[1]}", callback_data=k)]
            for k, v in TYPES.items()
        ]
        await query.edit_message_text(
            "Выбери тип поста:",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    elif data.startswith("regen_"):
        type_id = data.replace("regen_", "")
        context.user_data["type"] = type_id
        icon, label, _ = TYPES[type_id]
        await query.edit_message_text(
            f"{icon} {label} — пришли данные ещё раз для нового варианта."
        )
    else:
        # Normal type selection
        await handle_type(update, context)

async def menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton(f"{v[0]} {v[1]}", callback_data=k)]
        for k, v in TYPES.items()
    ]
    await update.message.reply_text(
        "Выбери тип поста:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    # Запускаем Flask на отдельном потоке — он держит сервис "живым" для Render
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    print(f"Flask keep-alive сервер запущен на порту {PORT}")

    # Бот работает в основном потоке как обычно
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("menu", menu))
    app.add_handler(CallbackQueryHandler(handle_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    print("Бот запущен...")
    app.run_polling()

if __name__ == "__main__":
    main()
