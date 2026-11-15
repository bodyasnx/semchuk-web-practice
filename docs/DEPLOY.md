# Деплой і PWA

**Практична робота:** ПР 10 «Деплой, PWA і реліз»

| Частина | Хостинг | Адреса |
|---|---|---|
| Сайт (React, `client/app`) | Netlify | https://smak-tradytsii.netlify.app |
| API (Express, `server`) | Render, план Free | https://smak-tradytsii-api.onrender.com/api/recipes |
| Код | GitHub | https://github.com/bodyasnx/semchuk-web-practice, гілка `main` |

## 1. Як це працює

```
           git push у main
                 │
     ┌───────────┼──────────────────────┐
     ▼           ▼                      ▼
 GitHub Actions  Netlify                Render
 (CI: тести     (npm run build у        (npm ci + npm start у server/,
  і збірка)      client/app → dist/,     Node.js-процес з API)
                 роздає статичні файли)
                       │   fetch /api/...    ▲
                       └─────────────────────┘
          браузер: сайт з Netlify звертається до API на Render (CORS)
```

- **Netlify** — хостинг *статики*: один раз збирає сайт (`vite build`) і роздає готові файли
  HTML/CSS/JS/фото через CDN. Свого коду на сервері не виконує.
- **Render** — хостинг *сервера*: постійно тримає запущений процес Node.js, який обробляє запити
  до API і читає/пише JSON-файли.
- **CI** (`.github/workflows/ci.yml`) — на кожен push і PR запускає тести API, тести клієнта і збірку.
  **CD** — Netlify і Render самі деплоять кожен новий коміт у `main`.

## 2. Сервер на Render

Налаштування Web Service (ті самі значення описано в `render.yaml` у корені — Render Blueprint):

| Поле | Значення | Навіщо |
|---|---|---|
| Тип сервісу | **Web Service** | постійно запущений процес з HTTP-адресою (не Static Site) |
| Root Directory | `server` | команди виконуються в теці API, а не в корені репозиторію |
| Runtime | Node | |
| Build Command | `npm ci` | встановлює залежності точно за `package-lock.json` |
| Start Command | `npm start` | `node src/index.js` |
| Instance Type | Free | |
| Health Check Path | `/api/health` | Render перевіряє, що сервер відповідає `{"status":"ok"}` |

Змінні середовища:

| Змінна | Значення | Пояснення |
|---|---|---|
| `CLIENT_ORIGIN` | `https://smak-tradytsii.netlify.app,https://*--smak-tradytsii.netlify.app,http://localhost:5173` | CORS: лише цьому сайту браузер дозволить читати відповіді API. Кілька адрес — через кому. «/» у кінці сервер прибирає сам (`server/src/lib/origins.js`) |
| `NODE_VERSION` | `22` | версія Node.js для збірки і запуску |
| `PORT` | **не задаємо** | Render сам передає процесу порт (зазвичай 10000); `server/src/config.js` читає `process.env.PORT` |

**Deploy previews Netlify.** Для кожного PR Netlify публікує попередню версію за адресою
`https://deploy-preview-<N>--<сайт>.netlify.app`. Щоб вона теж працювала з API, у `CLIENT_ORIGIN` можна
додати шаблон `https://*--<сайт>.netlify.app`: зірочка замінює лише частину одного сегмента домену
(літери, цифри, дефіс), тож чужий сайт під цей шаблон не потрапить (див. `server/test/origins.test.js`).
Шаблон `https://*.netlify.app` додавати **не можна** — він дозволив би будь-який сайт на Netlify.

## 3. Клієнт на Netlify

Налаштування збірки лежать у `client/app/netlify.toml`, в інтерфейсі Netlify потрібна лише
Base directory і змінна з адресою API.

| Поле | Значення |
|---|---|
| Base directory | `client/app` |
| Build command | `npm run build` |
| Publish directory | `client/app/dist` (у `netlify.toml` — `dist` відносно base) |
| Змінна `VITE_API_URL` (в інтерфейсі Netlify) | `https://smak-tradytsii-api.onrender.com` — адреса API без «/» у кінці |
| Змінна `VITE_SITE_URL` (у `netlify.toml`) | `https://smak-tradytsii.netlify.app` — для canonical, Open Graph і JSON-LD |

**Важливо:** змінні `VITE_*` Vite вбудовує в JS **під час збірки**. Після зміни `VITE_API_URL`
у Netlify треба перезібрати сайт (Deploys → Trigger deploy), інакше він і далі звертатиметься до старої адреси.
Тому в `VITE_*` не можна класти секрети — їх видно в коді сторінки.

Що робить `netlify.toml`:

- **Redirect для React Router.** `from = "/*"`, `to = "/index.html"`, `status = 200` — це *rewrite*:
  на пряме відкриття `/recipes/borshch` чи оновлення сторінки Netlify віддає `index.html`, адреса в браузері
  не змінюється, а сторінку обирає React Router. Без цього правила Netlify повернув би 404, бо файлу
  `recipes/borshch` на диску немає. Правило не має `force`, тож наявні файли (`sw.js`, `robots.txt`, фото)
  віддаються як є.
- **Кешування.**

  | Адреса | `Cache-Control` | Чому |
  |---|---|---|
  | `/static/*` (JS, CSS) | `public, max-age=31536000, immutable` | хеш у назві: новий код — нова назва файлу |
  | `/images/*`, `/fonts/*`, `/assets/*`, `/icons/*` | `public, max-age=2592000` (30 днів) | назви без хешу, змінюються рідко |
  | `index.html` та інші сторінки | за замовчуванням Netlify: `max-age=0, must-revalidate` | після деплою — одразу нова версія |
  | `/sw.js` | `no-cache` | браузер щоразу перевіряє, чи не вийшла нова версія SW |

  Щоб розділити файли з хешем і без, Vite кладе зібрані JS і CSS у `/static/`
  (`build.assetsDir` у `vite.config.js`), а не в `/assets/`, де лежать SVG з `public/`.
- **Заголовки безпеки:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

## 4. Обмеження безкоштовного Render — чесно

1. **«Засинання».** Якщо 15 хвилин до API не було запитів, Render зупиняє сервер. Наступний запит
   його «будить», і це триває **до ~1 хвилини**: каталог показує лоадер, а через 6 с — пояснення
   «Сервер на безкоштовному хостингу прокидається…» (`Loader.jsx`). Далі все працює швидко.
2. **Файлова система не постійна.** API зберігає дані в `server/data/*.json`, але на Render диск
   «одноразовий»: після кожного перезапуску (засинання, новий деплой, збій) файли повертаються до
   стану з репозиторію. **Додані, змінені й видалені рецепти та повідомлення з форми контактів
   зникають** — лишаються 10 рецептів з `recipes.json`. Для навчального проєкту це прийнятно;
   для справжнього сайту потрібна база даних (наприклад, PostgreSQL чи MongoDB Atlas) або платний
   постійний диск Render.
3. **Ліміт часу роботи** — 750 год/міс на всі безкоштовні сервіси акаунта: одного сервісу вистачає
   на весь місяць.

## 5. PWA

PWA (Progressive Web App) — сайт, який можна встановити як застосунок (іконка на головному екрані,
окреме вікно без адресного рядка) і який коректно поводиться без мережі.

| Частина | Файл | Що робить |
|---|---|---|
| Маніфест | `public/manifest.webmanifest` | назва, `short_name`, `start_url`, `display: standalone`, кольори з токенів (`#1f5135` — `--color-primary`, `#fbf6ec` — `--color-bg`), іконки, ярлики «Каталог» і «Додати рецепт» |
| Скриншоти | `public/screenshots/` | `wide` 1280×800 (головна) і `narrow` 780×1688 (рецепт на телефоні), зняті з живого сайту. Без них Chrome попереджає «Richer PWA install UI won't be available» і показує лише просте вікно встановлення |
| Іконки | `public/icons/` | 192 і 512 px (`any`), 512 px `maskable` (роза займає 60 %, у безпечній зоні 80 %), `apple-touch-icon` 180 px для iOS. Згенеровано з `assets/logo-mark.svg` скриптом на `sharp` |
| Service worker | `src/sw.js` → `dist/sw.js` | кешування і офлайн-сторінка (нижче) |
| Реєстрація | `src/utils/registerServiceWorker.js` | лише в production-збірці, після події `load` |
| Офлайн-сторінка | `public/offline.html` | «Немає з'єднання з інтернетом»: рецепти потребують сервера; кнопка «Спробувати ще», автоматичне оновлення при поверненні мережі; світла і темна тема |

**Стратегії кешування в `sw.js`:**

| Запит | Стратегія | Чому |
|---|---|---|
| Сторінки (навігація) | лише мережа → без мережі `offline.html` | HTML завжди свіжий після деплою; без API сайт усе одно не має що показати |
| `/static/*` (JS, CSS) | спершу кеш | файл з тим самим хешем не змінюється |
| Фото, SVG, шрифти, іконки | кеш + оновлення у фоні (stale-while-revalidate), до 80 файлів | миттєвий показ уже бачених фото |
| API на Render, мапа OSM | не перехоплюються | рецепти мають бути актуальними; чужі домени SW не кешує |

Під час встановлення SW заздалегідь кешує `offline.html`, логотип і два кириличні шрифти — усе,
що потрібно офлайн-сторінці. Версію кешу (`VERSION`) плагін у `vite.config.js` рахує як хеш файлів
збірки: кожен деплой зі зміненим кодом встановлює новий SW, а той видаляє кеші попередньої версії.

Власний SW обрано замість `vite-plugin-pwa`: потрібні лише 3 прості стратегії, тож ~115 рядків з коментарями
без нових залежностей, і кожен рядок можна пояснити.

**Перевірка (локально, 15.11.2026, Chrome 157):** `npm run build` + `npm run preview`:
маніфест без помилок, `Page.getInstallabilityErrors` — порожньо (сайт встановлюваний);
SW `activated`, кеші `smak-precache-…` (4 файли), `smak-static-…`, `smak-media-v1`;
після зупинки сервера сайту `/contacts` і `/recipes/borshch` показують офлайн-сторінку з логотипом
і шрифтом Lora з кешу.

**Як перевірити в DevTools:** F12 → **Application** → *Manifest* (назва, кольори, іконки, без
помилок) → *Service workers* (статус `activated and is running`, прапорець **Offline** вмикає
режим без мережі) → *Cache storage* (три кеші `smak-…`). У режимі Offline оновіть сторінку —
має з'явитися «Немає з'єднання з інтернетом».

## 6. Перевірка після деплою

**Дата:** 15.11.2026, сайт з гілки `release/v1.0.0` (коміт 1 ПР 10), Chrome 157.

### 6.1 Функції (скрипт puppeteer на живому сайті)

| Перевірка | Результат |
|---|---|
| Головна | h1 «Рецепти української кухні», картки популярних рецептів з API |
| Каталог | «Знайдено 10 рецептів»; пошук «вареники» → 2 рецепти, запит у URL `?q=…` |
| Рецепт, порції | «+» на борщі (база 4): свинина 500 г → 625 г на 5 порцій |
| Пряме відкриття `/recipes/borshch` | 200, сторінка рецепта (rewrite з `netlify.toml`) |
| Оновлення сторінки (F5) на `/recipes/borshch` | 200, сторінка рецепта, а не 404 Netlify |
| Неіснуючий `/nope` | сторінка 404 сайту з `noindex` |
| Форма контактів | `POST /api/contact` на Render → **201**, «Дякуємо, … Повідомлення надіслано» |
| SEO на рецепті | canonical і `og:url` = `https://smak-tradytsii.netlify.app/recipes/borshch`, JSON-LD `Recipe` |
| Service worker | `activated` |
| Консоль і мережа | 0 помилок |

### 6.2 Заголовки і CORS (curl)

| Перевірка | Результат |
|---|---|
| `/`, `/recipes/borshch`, `/contacts` | 200, `text/html`, `max-age=0, must-revalidate` |
| `/static/index-….js` | `public, max-age=31536000, immutable` |
| `/sw.js` | `no-cache`; `/manifest.webmanifest` — `application/manifest+json` |
| Заголовки безпеки | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` |
| `Origin: https://smak-tradytsii.netlify.app` | `Access-Control-Allow-Origin` повернено |
| `Origin: https://deploy-preview-1--smak-tradytsii.netlify.app` | повернено (шаблон `*--`) |
| `Origin: https://evil.netlify.app` | заголовка немає — браузер заблокує відповідь |

### 6.3 Lighthouse на живому сайті (mobile, 2 прогони)

| Сторінка | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Головна | 99 / 98 | 100 | 100 | 100 | 2,1–2,2 с | 0 |
| Каталог | 97 / 98 | 100 | 100 | 100 | 2,4–2,6 с | 0–0,003 |
| Рецепт | 98 / 98 | 100 | 100 | 100 | 2,3–2,4 с | 0–0,003 |

На хостингу результат кращий, ніж у локальному аудиті ПР 9 (каталог 91 → 97–98). Найімовірніша
причина — Netlify віддає файли через CDN зі стисненням, а `vite preview` локально — без нього. Єдине зауваження щодо кешу — скрипт самого Netlify
`/.netlify/scripts/hud` (плашка «Powered by Netlify», яку Netlify додає на безкоштовні сайти), а не файли проєкту.
Сервер API перед замірами було «розбуджено» запитом до `/api/health` — після засинання перший
показ каталогу буде довшим (розділ 4).
