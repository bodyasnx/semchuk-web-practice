# Смак Традиції — рецепти української кухні

Веб-сайт із рецептами української кухні та автоматичним перерахунком інгредієнтів
на потрібну кількість порцій. Проєкт виконано в межах навчальної практики
«WEB-технології та WEB-дизайн».

## Стек

- **Клієнт:** React 18 (Vite), React Router, CSS custom properties
- **Сервер:** Node.js, Express 5, cors, dotenv, morgan; дані в JSON-файлах
- **Тести:** Vitest, React Testing Library (ПР 9)
- **Деплой:** Vercel (клієнт), Render (API) (ПР 10)

## Структура репозиторію

```
client/app/      React-застосунок (ПР 7–8)
client/static/   статична версія на HTML/CSS/JS (ПР 4–6)
server/          REST API на Express (ПР 8)
docs/            документація: ТЗ, UX, дизайн, API, журнал AI, колекція Postman
```

## Запуск локально

Потрібен **Node.js 20.19 або новіший** (`node -v`).

### 1. Встановити залежності (один раз)

```bash
npm run setup
```

Команда встановлює пакети в корені, у `server/` і в `client/app/`.

### 2. Налаштування (необов'язково)

Без файлів `.env` усе працює зі значеннями за замовчуванням. Щоб змінити порт чи адресу:

```bash
cp server/.env.example server/.env           # PORT=3001, CLIENT_ORIGIN=http://localhost:5173
cp client/app/.env.example client/app/.env   # VITE_API_URL=http://localhost:3001
```

### 3. Запустити сервер і клієнт одночасно

```bash
npm run dev
```

`concurrently` запускає обидві частини в одному терміналі, рядки журналу позначено `[api]` і `[web]`:

| Частина | Адреса |
|---|---|
| API | http://localhost:3001/api/recipes |
| Сайт | http://localhost:5173 |

Зупинити — `Ctrl+C`.

**Варіант із двома терміналами** (зручно, щоб журнали не змішувалися):

```bash
# термінал 1
cd server && npm run dev

# термінал 2
cd client/app && npm run dev
```

Сайт без запущеного API показує повідомлення «Не вдалося з'єднатися із сервером» і кнопку
«Спробувати ще».

### Інші команди

| Команда | Що робить |
|---|---|
| `npm run build` | Production-збірка клієнта в `client/app/dist/` |
| `npm run start:api` | Запуск API без автоперезапуску |
| `npm test` | Автотести: API (`node:test`) і клієнт (Vitest + React Testing Library) |

## Документація

- [docs/TZ.md](docs/TZ.md) — технічне завдання
- [docs/API.md](docs/API.md) — ендпоінти, формат помилок, приклади curl
- [docs/postman/](docs/postman/) — колекція Postman
- [docs/REACT.md](docs/REACT.md) — дерево компонентів і потоки даних
- [docs/TESTING.md](docs/TESTING.md) — автотести і чек-лист ручного тестування
- [docs/AI.md](docs/AI.md) — журнал використання AI

## Ліцензія

MIT
