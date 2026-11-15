# REST API «Смак Традиції»

**Практична робота:** ПР 8 «Серверна частина на Node.js + Express»
**Код:** [server/](../server/) — Node.js 20.19+, Express 5, cors, dotenv, morgan.
**Дані:** JSON-файли в `server/data/` (читання і запис через `fs/promises`).
**Колекція Postman:** [postman/semchuk-api.postman_collection.json](postman/semchuk-api.postman_collection.json).

## 1. Запуск

```bash
cd server
npm install
cp .env.example .env     # за потреби змініть PORT і CLIENT_ORIGIN
npm run dev              # node --watch: перезапуск після зміни коду
# або npm start          # звичайний запуск
```

API: `http://localhost:3001`. Перевірка: `http://localhost:3001/api/health` → `{"status":"ok"}`.

| Змінна (`server/.env`) | За замовчуванням | Призначення |
|---|---|---|
| `PORT` | `3001` | Порт сервера |
| `CLIENT_ORIGIN` | `http://localhost:5173,http://localhost:4173` | Адреси React-клієнта для CORS через кому: 5173 — `npm run dev`, 4173 — `npm run preview` |
| `DATA_DIR` | `server/data/` | Тека з JSON-файлами (для тестів у ПР 9) |

## 2. Ендпоінти

| Метод | Шлях | Тіло запиту | Успіх | Помилки |
|---|---|---|---|---|
| GET | `/api/recipes` | — | **200** масив рецептів | 500 |
| GET | `/api/recipes/:id` | — | **200** рецепт | 404, 500 |
| POST | `/api/recipes` | рецепт (JSON) | **201** створений рецепт + заголовок `Location` | 400, 413, 500 |
| PUT | `/api/recipes/:id` | рецепт (JSON), усі поля | **200** оновлений рецепт | 400, 404, 413, 500 |
| DELETE | `/api/recipes/:id` | — | **204** без тіла | 404, 500 |
| POST | `/api/contact` | повідомлення (JSON) | **201** `{ id, createdAt }` | 400, 413, 500 |
| GET | `/api/health` | — | **200** `{ status: "ok" }` | — |

**Параметри `GET /api/recipes`** (усі необов'язкові, можна поєднувати):

| Параметр | Значення | Приклад |
|---|---|---|
| `q` | пошук у назві та назвах інгредієнтів, без урахування регістру | `?q=буряк` |
| `category` | `first`, `main`, `dumplings`, `baking`, `dessert`, `drinks`; кілька — повтором або через кому | `?category=dumplings&category=drinks` |
| `region` | `hutsulshchyna`, `poltavshchyna`, `halychyna`, `podillia`, `slobozhanshchyna` | `?region=halychyna` |
| `time` | `30` (до 30 хв), `60` (30–60 хв), `long` (понад 60 хв) | `?time=30` |
| `sort` | `title-asc` (за замовчуванням), `title-desc`, `time-asc`, `time-desc`, `newest` | `?sort=time-asc` |

## 3. Тіло запиту

**Рецепт** (POST, PUT). Поля `id`, `createdAt`, `image` встановлює сервер; невідомі поля ігноруються.

| Поле | Тип | Правила |
|---|---|---|
| `title` | string | обов'язкове, 3–100 символів (після обрізання пробілів) |
| `category` | string | одне з 6 значень категорії |
| `region` | string \| null | необов'язкове; одне з 5 значень регіону |
| `description` | string | необов'язкове, до 300 символів |
| `servings` | number | ціле, 1–20 |
| `cookTime` | number | ціле, 1–1440 хв |
| `difficulty` | string | `easy`, `medium`, `hard` |
| `ingredients` | array | 1–30 елементів `{ name, amount, unit }` |
| `ingredients[].name` | string | 2–60 символів |
| `ingredients[].unit` | string | `г`, `кг`, `мл`, `л`, `шт`, `ст. л.`, `ч. л.`, `зубчик`, `за смаком` |
| `ingredients[].amount` | number \| null | для `за смаком` — `null`; інакше > 0, ≤ 10000, не більше одного знака після коми |
| `steps` | string[] | 1–30 кроків, кожен 10–500 символів |

**Повідомлення** (POST `/api/contact`) — `ContactMessage` з [TZ.md](TZ.md), розділ 7:

| Поле | Тип | Правила |
|---|---|---|
| `name` | string | обов'язкове, 2–50 символів |
| `email` | string | обов'язкове, формат `name@example.com`, до 100 символів |
| `phone` | string \| null | необов'язкове, формат `+380XXXXXXXXX` |
| `topic` | string | `question`, `recipe`, `bug`, `partnership`, `other` |
| `message` | string | обов'язкове, 10–1000 символів |
| `consent` | boolean | має бути `true` |
| `newsletter` | boolean | необов'язкове |

Повідомлення зберігаються в `server/data/messages.json`. Файл створюється під час першого
повідомлення і **не потрапляє в git** (`.gitignore`), бо містить персональні дані.

## 4. Формат помилок

Усі помилки — JSON з полем `error` (текст для людини). Помилки валідації додатково мають
`details` — перелік по полях. Шлях поля в рядку списку містить індекс: `ingredients.1.amount`, `steps.0`.

```json
HTTP/1.1 400 Bad Request
{
  "error": "Перевірте дані форми.",
  "details": [
    { "field": "servings", "message": "Введіть число від 1 до 20." },
    { "field": "ingredients.0.amount", "message": "Кількість має бути більшою за 0." }
  ]
}
```

| Код | Коли |
|---|---|
| 400 | Помилки валідації (`details`); некоректний JSON у тілі |
| 404 | Рецепта з таким id немає; невідомий шлях |
| 413 | Тіло запиту більше 100 КБ |
| 500 | Непередбачена помилка сервера (подробиці — лише в журналі сервера, не у відповіді) |

## 5. Приклади curl

> У Windows кирилиця в аргументах curl часто псується через кодування консолі — запити з
> українським текстом зручніше надсилати з Postman. Приклади нижче — латиницею, а одиниця
> «г» записана JSON-екрануванням `г` (сервер отримує звичайну літеру «г»).

```bash
# Список, фільтр і сортування
curl "http://localhost:3001/api/recipes?category=dumplings&sort=time-asc"

# Один рецепт; неіснуючий → 404
curl -i http://localhost:3001/api/recipes/borshch
curl -i http://localhost:3001/api/recipes/nope

# Створити → 201 і Location: /api/recipes/test-borshch
curl -i -X POST http://localhost:3001/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test borshch","category":"first","servings":4,"cookTime":90,"difficulty":"easy",
       "ingredients":[{"name":"Beet","amount":300,"unit":"\u0433"}],"steps":["Cook the broth for one hour."]}'

# Оновити (PUT — усі поля) → 200
curl -i -X PUT http://localhost:3001/api/recipes/test-borshch \
  -H "Content-Type: application/json" \
  -d '{"title":"Test borshch","category":"first","servings":6,"cookTime":90,"difficulty":"easy",
       "ingredients":[{"name":"Beet","amount":450,"unit":"\u0433"}],"steps":["Cook the broth for one hour."]}'

# Видалити → 204; повторно → 404
curl -i -X DELETE http://localhost:3001/api/recipes/test-borshch

# Помилка валідації → 400 з details
curl -i -X POST http://localhost:3001/api/recipes -H "Content-Type: application/json" -d '{}'

# Повідомлення → 201
curl -i -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","topic":"question","message":"How long to cook?","consent":true}'
```

## 6. Як влаштовано

```
запит → morgan (журнал) → cors (лише CLIENT_ORIGIN) → express.json (до 100 КБ)
      → маршрут: validateBody (400) → обробник (fs/promises)
      → notFound (404, якщо жоден маршрут не підійшов)
      → errorHandler (400 зламаний JSON, 413, 500)
```

| Файл | Відповідальність |
|---|---|
| `src/index.js` | Запуск сервера на `PORT` |
| `src/app.js` | `createApp()`: ланцюжок middleware і маршрути (окремо від запуску — для тестів ПР 9) |
| `src/config.js` | Змінні середовища через dotenv |
| `src/store.js` | JSON-сховище: `readCollection`, `updateCollection` (черга записів + атомарний запис через тимчасовий файл) |
| `src/routes/recipes.js`, `contact.js` | Ендпоінти |
| `src/middleware/validate.js` | `validateBody(validator)` → 400 або `req.validBody` з очищеними даними |
| `src/middleware/errors.js` | `notFound` і централізований `errorHandler` |
| `src/validation/*.js` | Правила рецепта і повідомлення (чисті функції) |
| `src/lib/query.js`, `slug.js` | Пошук/фільтри/сортування; id з назви: «Мамин борщ» → `mamyn-borshch` |

Express 5 сам передає помилку з `async`-обробника в `errorHandler`, тому в маршрутах немає `try/catch`.

## 7. Перевірка

- Автоматичний скрипт (Node.js `fetch`) — 28 перевірок: усі ендпоінти і коди 200/201/204/400/404/413/500,
  `Location`, унікальний id для однакових назв, шляхи полів у `details`, CORS для дозволеного й чужого `Origin`.
  Код 500 перевірено, навмисно зіпсувавши JSON-файл даних у тестовій копії.
- Колекція Postman через Newman: 14 запитів, 29 перевірок, 0 помилок.
- React-клієнт ↔ API в Chrome: пошук і фільтри на сервері, створення, редагування (зокрема показ
  помилки сервера під потрібним полем), видалення з модальним вікном, форма контактів,
  недоступний сервер → зрозуміле повідомлення і збережені дані форми.
