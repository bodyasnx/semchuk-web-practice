# Журнал змін

Формат — [Keep a Changelog](https://keepachangelog.com/uk/1.1.0/), версії —
[семантичне версіонування](https://semver.org/lang/uk/) (`MAJOR.MINOR.PATCH`).
До релізу 1.0.0 кожна практична робота позначалася тегом `pr-NN`.

## [1.0.0] — 2026-11-15

Перший публічний реліз: сайт розміщено в інтернеті, його можна встановити як застосунок.
Тег `v1.0.0` стоїть на тому самому коміті, що й `pr-10`.

- Сайт: https://smak-tradytsii.netlify.app
- API: https://smak-tradytsii-api.onrender.com/api/recipes

### Додано
- Деплой: React-клієнт на Netlify (`client/app/netlify.toml`: rewrite для React Router, заголовки
  кешування і безпеки), API на Render (`render.yaml`).
- PWA: маніфест з іконками (зокрема maskable), скриншотами і ярликами; власний service worker
  (кешування статики й фото, офлайн-сторінка «Немає з'єднання з інтернетом»).
- CI на GitHub Actions: тести API і клієнта та production-збірка на кожен push і PR.
- CORS: адреси в `CLIENT_ORIGIN` без «/» у кінці і шаблон для deploy previews Netlify.
- Підказка в лоадері, що безкоштовний сервер «прокидається» до хвилини.
- `docs/DEPLOY.md`, `CHANGELOG.md`, оновлений README зі скриншотами.

### Змінено
- Справжня адреса сайту в `sitemap.xml`, `robots.txt`, canonical, Open Graph і JSON-LD.
- Зібрані JS і CSS — у теці `/static/` (окремо від SVG з `public/assets/`), щоб кешувати їх на рік.
- Версії `package.json` — 1.0.0. У ТЗ хостинг клієнта Vercel замінено на Netlify.

## [pr-09] — 2026-11-15 · Тестування, оптимізація, SEO і доступність
- 24 тести клієнта (Vitest, React Testing Library) і 5 тестів API (`node:test`), чек-лист на 15 кейсів.
- Lighthouse (mobile) ≥ 90 у всіх 4 категоріях: CLS 0, шрифти з власного сервера, preload,
  lazy loading маршрутів.
- SEO: унікальні title/description, canonical, Open Graph, JSON-LD `Recipe`, `robots.txt`, `sitemap.xml`.
- Доступність: 0 порушень axe у 32 перевірках, 0 issues у Chrome DevTools.

## [pr-08] — 2026-11-15 · REST API
- Express 5: CRUD рецептів на JSON-файлах (`fs/promises`, черга записів), `POST /api/contact`.
- Middleware: morgan, CORS для `CLIENT_ORIGIN`, ліміт тіла, 404 і централізований обробник помилок.
- Серверна валідація (400 з помилками по полях, 201 при успіху); React-клієнт працює через API.
- `docs/API.md`, колекція Postman.

## [pr-07] — 2026-11-15 · React-застосунок
- React 18 + Vite + React Router: 6 сторінок, 25 компонентів, хуки `useFetch`, `useLocalStorage`,
  `useDebounce`, `useForm`.
- Керовані форми з динамічними рядками інгредієнтів; пошук і фільтри в URL.

## [pr-06] — 2026-11-15 · Інтерактивність на JavaScript
- Дані 10 рецептів у JSON, рендер каталогу і сторінки рецепта через `fetch`.
- **Перерахунок інгредієнтів на кількість порцій** (`servings.js`) з округленням за одиницями.
- Пошук з debounce, фільтри, сортування, валідація форм, модальне вікно, перемикач теми.

## [pr-05] — 2026-11-15 · Стилізація і адаптивність
- Фото страв (Unsplash, Pexels) у WebP 480/800/1200.
- Верстка mobile-first (360, 768, 1280 px) і темна тема; порівняння чистого CSS з Tailwind.

## [pr-04] — 2026-11-14 · Семантична розмітка
- 6 HTML-сторінок, форми з HTML-валідацією, адаптивні зображення, мапа OpenStreetMap.
- 0 помилок W3C-валідатора.

## [pr-03] — 2026-11-14 · Дизайн-система
- Мудборд, палітра з перевіркою контрасту WCAG, дизайн-токени, типографіка з `clamp()`.
- Компоненти і SVG-орнаменти (логотип-роза, петриківка, значки регіонів).

## [pr-02] — 2026-11-14 · UX
- Персони, user stories, user flow, карта сайту; low-fi wireframe 4 екранів; юзабіліті-оцінка.

## [pr-01] — 2026-11-12 · Технічне завдання
- ТЗ, беклог, структура репозиторію, README, `.gitignore`, ліцензія MIT.

[1.0.0]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-09...v1.0.0
[pr-09]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-08...pr-09
[pr-08]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-07...pr-08
[pr-07]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-06...pr-07
[pr-06]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-05...pr-06
[pr-05]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-04...pr-05
[pr-04]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-03...pr-04
[pr-03]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-02...pr-03
[pr-02]: https://github.com/bodyasnx/semchuk-web-practice/compare/pr-01...pr-02
[pr-01]: https://github.com/bodyasnx/semchuk-web-practice/releases/tag/pr-01
