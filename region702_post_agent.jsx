import { useState, useRef } from "react";

const TODAY = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

const CARS = `
НАШИ АВТО — Прайс-лист Регион 702:

✅ ЛЬГОТНЫЙ УТИЛЬСБОР (≤160 л.с.):
• Mazda CX-5 — Comfort 2.0L 155 л.с. / Smart 2.0L 155 л.с.
• Mazda CX-50 — Максимальная 2.0L 155 л.с.
• KIA Seltos — Deluxe/Luxe 1.5L 115 л.с. / Deluxe чёрная крыша / Premium
• KIA K3 — Luxaru 1.5L 115 л.с.
• Hyundai Elantra — Luxe 1.5L 115 л.с.
• Nissan Qashqai — Honor 2.0L 140 л.с.
• Nissan X-Trail — Honor 2.0L 140 л.с.
• Škoda Superb — Exclusive 280, 1.4L 150 л.с.
• Audi Q3 — S-Line 1.5L 160 л.с.
• VW T-Roc / Tharu — ~115–150 л.с.
• Jetta VS5 / VS7 / VS8 — ~113–150 л.с.
• Honda CR-V — ~150 л.с.
• Nissan Teana — ~150 л.с.
• Toyota Levin — 1.2T 116 л.с.

⚠️ КОММЕРЧЕСКИЙ УТИЛЬСБОР (>160 л.с.):
• Toyota RAV4 — Luxury 2.0L 171 л.с.
• Toyota Wildlander — Pro+ 2.0L 171 л.с.
• Toyota Camry — Full Max Гибрид 2.0L
• Geely Monjaro — Flagship 2.0L 272 л.с.
• Tank 300 — Максимальная 2.0L 220 л.с.
• Changan A06 — электро 286 л.с.

Также привозим б/у авто из Китая с пробегом по запросу.`;

const FOOTER = `📲 +7 937 8 561 566  @aduncan21\nⓂ️MAX 👈 Мы в Максе\nhttps://region-702.ru`;

const SYS = `Ты — SMM-специалист Telegram-канала «Регион 702» (region_702rus, Уфа).

КОМПАНИЯ: Частный привоз авто из Китая и Кыргызстана. НЕ автосалон и НЕ дилер.
Прямой экспорт — цены на 500 000–2 000 000 руб. ниже дилерских.
Оплата через ВТБ банк, официальный договор, цена «под ключ» (авто + доставка + таможня + СБКТС + ЭПТС + утильсбор).
Постановка на учёт в день сделки. Сроки: 25–45 дней из Китая, 5–7 из Бишкека.

${CARS}

КОНЕЦ КАЖДОГО ПОСТА:
${FOOTER}

СТИЛЬ: конкретные цифры, сравнение с дилерами/б/у Авито, инвестиционный взгляд. Без воды.
Отвечай ТОЛЬКО текстом поста. Без вступлений.`;

const SYS_INFO = `Ты — аналитик авторынка для Telegram-канала «Регион 702» (Уфа, частный привоз из Китая).

КРИТИЧЕСКИ ВАЖНО:
— Пиши ТОЛЬКО факты из результатов поиска. Сегодня: ${TODAY}.
— НЕ придумывай цифры, даты и события. Если данных нет — скажи честно.
— Указывай источник в тексте если уместно.

${CARS}

СТИЛЬ ИНФОРМАЦИОННОГО ПОСТА:
— Аналитический, конкретные цифры и даты
— Объясни что новость означает для покупателя авто
— Свяжи с нашими авто если уместно (особенно с льготным утильсбором ≤160 л.с.)
— Не рекламный, а образовательный тон

КОНЕЦ ПОСТА:
По вопросам заказа автомобиля 👇
${FOOTER}

Пиши ТОЛЬКО готовый текст поста. Без вступлений.`;

const TYPES = [
  { id:"in_stock", icon:"❗️", label:"Авто в наличии", color:"#dc2626", bg:"#fee2e2",
    hint:"Toyota RAV4 2.0 CVT 171л.с. AWD 2026, макс. комплект., кожа, панорама, обогревы, 3 897 000₽",
    note:`❗️В ПРОДАЖЕ → авто в наличии в Уфе, постановка в день сделки → оплата через ВТБ, прозрачный валютный контроль → полные характеристики → подробная комплектация → утильсбор оплачен, СБКТС и ЭПТС получены → 🔑 цена → «Больше фото на Авито 👈»`,
    chips:["Toyota RAV4 2.0 CVT 171л.с. AWD 2026, макс. комплект., 3 897 000₽","Mazda CX-5 Smart 2.0 155л.с. 2026, 2 580 000₽","KIA Seltos Deluxe 1.5L 115л.с. 2026, 2 020 000₽"], hasImage:false },
  { id:"used_order", icon:"🔥", label:"Б/У к заказу", color:"#d97706", bg:"#fef3c7",
    hint:"Toyota Levin 185T 2022, 1.2T 116л.с. CVT, пробег 53 952 км, тёмный салон красная строчка, мультимедиа, 1 500 000₽ под ключ",
    note:`🔥 ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ в бюджете до X руб. → модель (техбрат такого-то) → характеристики через ▪️ → пробег с «честный, подтверждён на фото» → 💰 Цена под ключ включает ВСЁ (авто + доставка + таможня + документы + утильсбор). Никаких скрытых доплат → «Команда Region 702 проверила по всем пунктам»`,
    chips:["Toyota Levin 185T 2022, 1.2T CVT, 53 952 км, 1 500 000₽","Honda CR-V 2021, 1.5T, 45 000 км, 2 100 000₽","Nissan Qashqai 2020, 2.0L, 38 000 км, 1 700 000₽"], hasImage:true },
  { id:"order_new", icon:"✅", label:"Доступен к заказу", color:"#16a34a", bg:"#dcfce7",
    hint:"Lynk&Co 06 2026 Ultra, 1.5T 181л.с. DCT, 2 550 000₽ под ключ до Уфы",
    note:`Название авто (год) ✅ + «проверен и готов к заказу» → 1 строка о модели/платформе → характеристики через дефис (-) → комплектация через дефис (-) → «Все гарантии, договор: region-702.ru» → CTA «расчёт под ключ до вашего города»`,
    chips:["Lynk&Co 06 2026 Ultra, 1.5T 181л.с. DCT, 2 550 000₽","Honda CR-V 2026, максимальная комплектация","Audi Q3 S-Line 2026, 1.5L 160л.с., льготный утильсбор"], hasImage:false },
  { id:"delivered", icon:"🏆", label:"Авто вручён", color:"#2563eb", bg:"#dbeafe",
    hint:"Nissan Qashqai для Фаиза, макс. комплект., бронирование плёнкой + тонировка + антикор. Семья обращается повторно.",
    note:`Тёплый пост: поздравление + цена 🔑 + срок. Варианты: 1) короткий «Выполненный заказ меньше 1 месяца!» 2) с допработами перед выдачей 3) честная история если была трудность. Всегда «Благодарим за доверие» + пожелание на дорогах.`,
    chips:["Toyota RAV4 вручён, 2 050 000₽, меньше месяца","Nissan Qashqai для Фаиза, с бронированием и тонировкой","Сложная сделка — банк задержал платёж, решили всё"], hasImage:false },
  { id:"purchased", icon:"💪", label:"Выкуплен / едет", color:"#7c3aed", bg:"#ede9fe",
    hint:"Toyota RAV4 макс. комплект. выкуплен. Курс даёт возможность купить дешевле — успевайте.",
    note:`Короткий динамичный пост. Варианты: «Выкуплен X! Курс даёт возможность — пользуйтесь!» / «Авто осмотрен, проверен, выкуплен! Новый X по цене б/у Y» / «Авто в Хоргосе, осматриваем, оплачиваем через ВТБ. Обратите внимание на комплектацию». CTA: «Успевайте фиксировать цены».`,
    chips:["Toyota RAV4 выкуплен, курс выгодный — фиксируйте","VW T-ROC для Марии — как б/у Golf но новый и богаче","Авто в Хоргосе, проверен, оплачиваем ВТБ"], hasImage:false },
  { id:"inspected", icon:"🔍", label:"Осмотрен, ждём оплату", color:"#0d9488", bg:"#ccfbf1",
    hint:"Honda CR-V 2022 для клиента Динара. Осмотр пройден, состояние подтверждено, согласовано с клиентом. Готовим инвойс, ждём оплату.",
    note:`Авто найден по запросу клиента, осмотрен нашим специалистом в Китае и СОГЛАСОВАН клиентом для заказа. Сейчас этап: готовится/выставлен инвойс, ожидается оплата. Это промежуточный статус ДО выкупа (отличается от «Выкуплен/едет» — там уже оплачено). Структура: 🔍 «Автомобиль найден и осмотрен по запросу нашего клиента [имя если есть]!» → краткое описание авто и его состояния по итогам осмотра (кузов/салон/техническая часть — честно, по делу) → «Клиент согласовал автомобиль к заказу ✅» → «Готовим инвойс и контракт, ожидаем оплату через ВТБ» → можно добавить: «Как только оплата пройдёт — начинаем логistику и таможенное оформление» → CTA в духе «Ищете похожий авто? Пишите — подберём и проверим»`,
    chips:["Honda CR-V 2022 для Динара, осмотр пройден, ждём оплату","Mazda CX-5 2021 согласован клиентом, готовим инвойс","Nissan Qashqai найден и проверен, клиент одобрил — ждём оплату"], hasImage:true },
  { id:"comparison", icon:"📊", label:"Б/У vs Новый", color:"#0891b2", bg:"#cffafe",
    hint:"Mazda CX-5 — Авито б/у 2019-2024 от 2.75 до 4 млн, новая Smart у нас 2.59 млн",
    note:`🚗 ЗАЧЕМ ПОКУПАТЬ Б/У, ЕСЛИ НОВЫЙ ДЕШЕВЛЕ? → «Посмотрели рынок» → 🔍 Авито: конкретные б/у с годами и ценами → «Сравните с нашим» → 🔵 наше авто: модель, комплект, 0 км, 💰 цена → ✅ список комплектации → ✔️ итог: новый / 0 км / ликвидность → вопрос-провокация → CTA`,
    chips:["Mazda CX-5: Авито б/у от 2.75–4 млн, новая Smart 2.59 млн","KIA Seltos: б/у 1.8–2.2, новый 2.02 млн","Nissan Qashqai: б/у от 2.2 млн, новый от 2.08 млн"], hasImage:false },
  { id:"budget", icon:"💰", label:"За такой бюджет", color:"#16a34a", bg:"#dcfce7",
    hint:"2 500 000₽",
    note:`🛑 ДИЛЕММА НА X РУБ. → что дают дилеры РФ за эти деньги (голые базы, отечественное) → «Через Регион 702 можно привезти:» → список с флагами и ценами «от X руб.» → «Почему напрямую дешевле?» (только авто + логистика + пошлина, без накруток) → CTA`,
    chips:["Что привезём до 2 000 000₽","Что можно заказать до 2 500 000₽","Что привезём до 3 000 000₽"], hasImage:false },
  { id:"market", icon:"💱", label:"Курс / Рынок", color:"#d97706", bg:"#fef3c7",
    hint:"Доллар вырос на 4₽ за 3 дня → RAV4 33 500$ → дороже на 134 000₽ (33 500 × 4)",
    note:`Факт → расчёт (X$ × Y₽ = Z₽) → совет → авто в наличии если есть → CTA. Тон: спокойный, аналитический. Только конкретные цифры. Без паники.`,
    chips:["Доллар вырос на 4₽ за 3 дня — RAV4 дороже на 134 000₽","Рубль укрепился — выгодный момент для заказа","Утильсбор растёт до 2030 — разбираем ситуацию"], hasImage:false },
  { id:"story", icon:"📖", label:"История / Кейс", color:"#64748b", bg:"#f1f5f9",
    hint:"Девушка искала KIA Seltos у дилеров — 2.5 млн и 3 месяца. Мы: 2.02 млн и 35–45 дней + тёплый пакет в подарок.",
    note:`📖 ИСТОРИЯ ИЗ ОФИСА → описание клиента → «Сравните два предложения:» → ❌ Автосалон: цена / срок / схема → ✅ Регион 702: цена / срок / официальный договор → бонус если был → «Итог: сэкономил X, получил в 2 раза быстрее» → CTA`,
    chips:["Клиентка искала Seltos — дилер 2.5 млн / мы 2.02 млн","Сравнение по RAV4: дилер vs частный привоз, экономия 500к","Почему стоит ждать 45 дней — математика времени"], hasImage:false },
  { id:"info", icon:"📰", label:"Информационный", color:"#1d4ed8", bg:"#dbeafe",
    hint:"Напиши тему или нажми «Найти свежие темы» — агент сам найдёт актуальные новости",
    note:`Информационный пост на основе РЕАЛЬНЫХ актуальных данных из поиска. Аналитический тон. Связь с нашими авто если уместно. НЕ придумывать факты.`,
    chips:["Изменения утильсбора 2026 — что нового","Продажи авто из Китая в России — свежая статистика","Какие авто под льготный утильсбор сейчас выгоднее всего"], hasImage:false },
];

async function apiCall(systemPrompt, userMsg, useSearch = false) {
  const body = {
    model: "claude-sonnet-4-6", max_tokens: 1500, system: systemPrompt,
    messages: [{ role: "user", content: userMsg }],
    ...(useSearch ? { tools: [{ type: "web_search_20250305", name: "web_search" }] } : {})
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
}

export default function App() {
  const [type, setType] = useState(TYPES[0]);
  const [input, setInput] = useState("");
  const [imgs, setImgs] = useState([]);
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadTopics, setLoadTopics] = useState(false);
  const [topics, setTopics] = useState([]);
  const [copied, setCopied] = useState(false);
  const [shortening, setShortening] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("write");
  const [searchStatus, setSearchStatus] = useState("");
  const fileRef = useRef();

  const switchType = (t) => { setType(t); setInput(""); setPost(""); setErr(""); setTopics([]); setImgs([]); setSearchStatus(""); };

  const addImgs = (e) => {
    Array.from(e.target.files).slice(0, 3).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setImgs(p => [...p, { b64: ev.target.result.split(",")[1], mime: f.type, src: ev.target.result }].slice(0, 3));
      r.readAsDataURL(f);
    });
  };

  const suggestRegularTopics = async () => {
    setLoadTopics(true); setTopics([]);
    try {
      const txt = await apiCall("", `Регион 702, Уфа, частный привоз авто из Китая. 4 темы для постов «${type.icon} ${type.label}». Реальные модели: Toyota RAV4, Mazda CX-5, KIA Seltos, Nissan Qashqai, VW T-Roc, Honda CR-V, Audi Q3. ТОЛЬКО JSON: ["тема1","тема2","тема3","тема4"]`);
      setTopics(JSON.parse(txt.replace(/```json|```/g, "").trim()));
    } catch { setTopics(["Ошибка — попробуй снова"]); }
    setLoadTopics(false);
  };

  const findInfoTopics = async () => {
    setLoadTopics(true); setTopics([]); setSearchStatus("🔍 Ищу свежие новости авторынка...");
    try {
      const txt = await apiCall(
        `Ты — аналитик авторынка. Сегодня ${TODAY}. Ищи ТОЛЬКО реальные актуальные новости. НЕ придумывай.`,
        `Найди 4 актуальных темы для постов по: курс рубля и цены на авто, утильсбор в России, импорт из Китая, продажи Mazda/KIA/Nissan/Toyota/Honda/VW/Audi в России 2025-2026, новые модели.
Верни ТОЛЬКО JSON (без markdown): [{"topic":"Заголовок","desc":"1-2 предложения о чём и почему важно покупателю"},...]
Только реальные темы из найденных источников.`,
        true
      );
      setSearchStatus("");
      const match = txt.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setTopics(parsed.map(t => typeof t === "object" ? `${t.topic} — ${t.desc}` : t));
      } else {
        setTopics([txt]);
      }
    } catch (e) { setSearchStatus(""); setTopics([`Ошибка поиска: ${e.message}`]); }
    setLoadTopics(false);
  };

  const generate = async (over) => {
    const txt = over !== undefined ? over : input;
    const isInfo = type.id === "info";
    setLoading(true); setErr(""); setPost("");
    if (isInfo) setSearchStatus("🔍 Ищу актуальную информацию...");

    const prompt = `Тип: ${type.icon} ${type.label}\n${type.note}\n\n${txt ? `Данные:\n${txt}` : "(Типовой пост для этой категории)"}`;
    const sys = isInfo ? SYS_INFO : SYS;

    const msgContent = imgs.length > 0
      ? [...imgs.map(i => ({ type: "image", source: { type: "base64", media_type: i.mime, data: i.b64 } })), { type: "text", text: prompt + "\n\nОпиши авто по фото." }]
      : prompt;

    try {
      const p = await apiCall(sys, typeof msgContent === "string" ? msgContent : JSON.stringify(msgContent), isInfo);
      setPost(p);
    } catch (e) { setErr(`Ошибка: ${e.message}`); }
    setLoading(false); setSearchStatus("");
  };

  const shorten = async () => {
    if (!post) return;
    setShortening(true); setErr("");
    try {
      const p = await apiCall(
        "Ты редактор текстов для Telegram-канала «Регион 702». Тебе дают готовый пост — сократи его, убрав воду, повторы и лишние слова, сохранив все факты, цифры, структуру (эмодзи-маркеры) и контакты в конце. Пост должен стать короче минимум на треть, но не терять смысл. Отвечай ТОЛЬКО сокращённым текстом поста, без пояснений.",
        `Сократи этот пост:\n\n${post}`
      );
      setPost(p);
    } catch (e) { setErr(`Ошибка сокращения: ${e.message}`); }
    setShortening(false);
  };

  const copy = () => { navigator.clipboard.writeText(post); setCopied(true); setTimeout(() => setCopied(false), 2500); };

  const tabBtn = (id, lbl) => (
    <button onClick={() => setTab(id)} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", border: tab === id ? "2px solid var(--border-accent)" : "0.5px solid var(--border)", background: tab === id ? "var(--bg-accent)" : "var(--surface-2)", color: tab === id ? "var(--text-accent)" : "var(--text-secondary)" }}>{lbl}</button>
  );

  const isInfo = type.id === "info";

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", maxWidth: 980, margin: "0 auto", padding: "1.25rem 1rem" }}>
      <h2 className="sr-only">Агент постов Регион 702</h2>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚗</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Агент постов — Регион 702</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Частный привоз · Уфа · region-702.ru</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {tabBtn("write", "✏️ Написать пост")}
          {tabBtn("cars", "🚗 Наши авто")}
        </div>
      </div>

      {tab === "write" && (
        <>
          {/* TYPE SELECTOR */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => switchType(t)} style={{ padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", border: type.id === t.id ? `2px solid ${t.color}` : "0.5px solid var(--border)", background: type.id === t.id ? t.bg : "var(--surface-2)", color: type.id === t.id ? t.color : "var(--text-secondary)" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* INFO BANNER */}
          {isInfo && (
            <div style={{ marginBottom: 12, padding: "10px 14px", background: "#eff6ff", border: "0.5px solid #bfdbfe", borderRadius: 10, fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>
              <strong>Режим поиска:</strong> агент найдёт актуальные новости в интернете и напишет пост только на основе реальных данных. Нажми «Найти свежие темы» или введи тему сам.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {/* IMAGE UPLOAD */}
              {type.hasImage && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>📷 Фото авто (до 3 шт.) — агент опишет по фото</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                    {imgs.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={img.src} style={{ width: 70, height: 52, objectFit: "cover", borderRadius: 6, border: "0.5px solid var(--border)" }} alt="" />
                        <button onClick={() => setImgs(p => p.filter((_, j) => j !== i))} style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                    ))}
                    {imgs.length < 3 && <button onClick={() => fileRef.current.click()} style={{ width: 70, height: 52, borderRadius: 6, border: "1px dashed var(--border-strong)", background: "var(--surface-1)", cursor: "pointer", fontSize: 20, color: "var(--text-muted)" }}>+</button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={addImgs} />
                </div>
              )}

              {/* TEXTAREA */}
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>
                  {isInfo ? "Тема для информационного поста (или нажми «Найти темы»)" : "Данные авто — вставь характеристики или кратко опиши"}
                </div>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={type.hint} style={{ width: "100%", boxSizing: "border-box", minHeight: 100, padding: "9px 10px", borderRadius: 8, border: "0.5px solid var(--border-strong)", background: "var(--surface-2)", color: "var(--text-primary)", fontSize: 13, lineHeight: 1.6, resize: "vertical", fontFamily: "inherit", outline: "none" }} />
              </div>

              {/* QUICK CHIPS */}
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Быстрые примеры — нажми и сгенерирует:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {type.chips.map((c, i) => (
                    <button key={i} onClick={() => { setInput(c); generate(c); }} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 12, textAlign: "left", cursor: "pointer", border: "0.5px solid var(--border)", background: "var(--surface-1)", color: "var(--text-secondary)", lineHeight: 1.4 }}>→ {c}</button>
                  ))}
                </div>
              </div>

              {/* SUGGEST BUTTON */}
              <button
                onClick={isInfo ? findInfoTopics : suggestRegularTopics}
                disabled={loadTopics}
                style={{ width: "100%", padding: "8px 0", borderRadius: 7, border: isInfo ? "0.5px solid #bfdbfe" : "0.5px solid var(--border-strong)", background: isInfo ? "#eff6ff" : "var(--surface-1)", color: isInfo ? "#1d4ed8" : "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: loadTopics ? "not-allowed" : "pointer" }}
              >
                {loadTopics ? (searchStatus || "Ищу…") : (isInfo ? "🔍 Найти свежие темы в интернете" : "✨ Предложить темы с помощью ИИ")}
              </button>

              {/* TOPICS */}
              {topics.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{isInfo ? "Реальные темы из интернета — нажми чтобы написать пост:" : "Нажми — вставит и сгенерирует:"}</div>
                  {topics.map((t, i) => (
                    <button key={i} onClick={() => { const v = typeof t === "string" ? t : t.topic; setInput(v); generate(v); }} style={{ padding: "8px 10px", borderRadius: 6, fontSize: 12, textAlign: "left", cursor: "pointer", border: `1px solid ${type.color}30`, background: type.bg, color: type.color, lineHeight: 1.5, fontWeight: 500 }}>
                      {isInfo ? "🌐 " : "💡 "}{typeof t === "string" ? t : `${t.topic} — ${t.desc}`}
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => generate()} disabled={loading} style={{ padding: "11px 0", borderRadius: 8, border: "none", background: loading ? "var(--fill-disabled)" : (isInfo ? "#1d4ed8" : "#1d4ed8"), color: "#fff", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? (searchStatus || "Пишу пост…") : `${type.icon} ${isInfo ? "Найти и написать пост ↗" : "Написать пост ↗"}`}
              </button>
            </div>

            {/* RIGHT: PREVIEW */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Готовый пост:</div>
              <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden", flex: 1, minHeight: 380 }}>
                <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚗</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>region_702rus</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Частный привоз · Уфа</div>
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{searchStatus || "⏳ Пишу пост…"}</div>}
                  {shortening && <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 8 }}>✂️ Сокращаю...</div>}
                  {err && <div style={{ color: "var(--text-danger)", fontSize: 13 }}>{err}</div>}
                  {!loading && !post && !err && <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7 }}>Выбери тип, вставь данные или нажми<br />быстрый пример — получи готовый пост.</div>}
                  {post && <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.75, color: "var(--text-primary)", margin: 0, fontFamily: "inherit" }}>{post}</pre>}
                </div>
              </div>
              {post && (
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={copy} style={{ flex: 1, padding: "9px 0", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "0.5px solid var(--border-strong)", background: copied ? "#dcfce7" : "var(--surface-2)", color: copied ? "#16a34a" : "var(--text-primary)" }}>{copied ? "✓ Скопировано!" : "📋 Скопировать"}</button>
                  <button onClick={shorten} disabled={shortening} title="Сократить пост" style={{ padding: "9px 12px", borderRadius: 7, fontSize: 13, cursor: shortening ? "not-allowed" : "pointer", border: "0.5px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)" }}>{shortening ? "✂️…" : "✂️ Короче"}</button>
                  <button onClick={() => generate()} style={{ padding: "9px 14px", borderRadius: 7, fontSize: 13, cursor: "pointer", border: "0.5px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)" }}>🔄</button>
                  <button onClick={() => { setPost(""); setInput(""); setTopics([]); setImgs([]); }} style={{ padding: "9px 14px", borderRadius: 7, fontSize: 13, cursor: "pointer", border: "0.5px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)" }}>✕</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "cars" && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: "1rem" }}>Прайс-лист Регион 702 — авто в агенте</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#16a34a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>✅ Льготный утильсбор (≤160 л.с.)</div>
              {[
                ["Mazda CX-5","Comfort / Smart · 2.0L 155 л.с."],
                ["Mazda CX-50","Максимальная · 2.0L 155 л.с."],
                ["KIA Seltos","Deluxe / Premium · 1.5L 115 л.с."],
                ["KIA K3","Luxaru · 1.5L 115 л.с."],
                ["Hyundai Elantra","Luxe · 1.5L 115 л.с."],
                ["Nissan Qashqai","Honor · 2.0L 140 л.с."],
                ["Nissan X-Trail","Honor · 2.0L 140 л.с."],
                ["Škoda Superb","Exclusive 280 · 1.4L 150 л.с."],
                ["Audi Q3","S-Line · 1.5L 160 л.с."],
                ["VW T-Roc / Tharu","~115–150 л.с."],
                ["Jetta VS5 / VS7 / VS8","~113–150 л.с."],
                ["Honda CR-V","~150 л.с."],
                ["Nissan Teana","~150 л.с."],
                ["Toyota Levin","1.2T 116 л.с."],
              ].map(([model, spec]) => (
                <div key={model} style={{ padding: "7px 10px", borderRadius: 7, marginBottom: 5, background: "#dcfce7", border: "0.5px solid #86efac" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#166534" }}>{model}</div>
                  <div style={{ fontSize: 11, color: "#15803d" }}>{spec}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#dc2626", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚠️ Коммерческий утильсбор ({">"}160 л.с.)</div>
              {[
                ["Toyota RAV4","Luxury · 2.0L 171 л.с."],
                ["Toyota Wildlander","Pro+ · 2.0L 171 л.с."],
                ["Toyota Camry","Full Max Гибрид · 2.0L"],
                ["Geely Monjaro","Flagship · 2.0L 272 л.с."],
                ["Tank 300","Максимальная · 2.0L 220 л.с."],
                ["Changan A06","Электро · 286 л.с."],
              ].map(([model, spec]) => (
                <div key={model} style={{ padding: "7px 10px", borderRadius: 7, marginBottom: 5, background: "#fee2e2", border: "0.5px solid #fca5a5" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#991b1b" }}>{model}</div>
                  <div style={{ fontSize: 11, color: "#b91c1c" }}>{spec}</div>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Также привозим б/у авто из Китая с пробегом и авто по индивидуальному запросу.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
