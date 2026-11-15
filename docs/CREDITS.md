# Джерела зображень, шрифтів і даних

На сайті використовуються лише власні матеріали або матеріали з вільною ліцензією.
Кожне стороннє зображення записується сюди: автор, посилання, ліцензія.

## 1. Фото страв

Фото завантажено з Unsplash і Pexels, обрізано до 4:3 і стиснуто скриптом на `sharp`.
Оригінали (1–6 МБ кожен) у репозиторій не додаються; метадані EXIF не переносяться.
Кожне фото зберігається у 4 файлах у `client/static/images/recipes/`:
`<id>-480.webp`, `<id>-800.webp`, `<id>-1200.webp` і `<id>-800.jpg`
(запасний варіант для браузерів без WebP).

| Страва | Файли (`<id>`) | Автор | Посилання | Ліцензія |
|---|---|---|---|---|
| Український борщ | `borshch` | див. посилання | [Pexels](https://www.pexels.com/photo/a-bowl-of-borscht-garnished-with-sour-cream-and-herbs-18955541/) | Pexels License |
| Вареники з картоплею | `varenyky-kartoplia` | див. посилання | [Unsplash](https://unsplash.com/photos/dumplings-plate-with-vegetables-and-cream-vyXImoqYezo) | Unsplash License |
| Вареники з вишнями | `varenyky-vyshni` | Valeriya | [Pexels](https://www.pexels.com/photo/sweet-dumplings-in-sauce-19969457/) | Pexels License |
| Полтавські галушки | `halushky` | Nadin Sh | [Pexels](https://www.pexels.com/photo/delicious-gnocchi-dish-being-served-38995734/) | Pexels License |
| Голубці | `holubtsi` | Zehra Yilmaz | [Pexels](https://www.pexels.com/photo/food-in-pot-20341364/) | Pexels License |
| Деруни | `deruny` | див. посилання | [Pexels](https://www.pexels.com/photo/polish-potato-pancakes-with-sour-cream-37645636/) | Pexels License |
| Банош із бринзою | `banosh` | Orhan Pergel | [Pexels](https://www.pexels.com/photo/hominy-on-a-spoon-and-various-vegetarian-dishes-15793780/) | Pexels License |
| Пампушки з часником | `pampushky` | Alena Evseenko | [Pexels](https://www.pexels.com/photo/freshly-baked-garlic-herb-dinner-rolls-34560965/) | Pexels License |
| Сирники | `syrnyky` | Max Nayman | [Unsplash](https://unsplash.com/photos/brown-and-white-pastry-on-white-ceramic-plate-hrGZ8nQD3QM) | Unsplash License |
| Узвар | `uzvar` | див. посилання | [Unsplash](https://unsplash.com/photos/glass-pitcher-and-apples-on-table-imEqHThoix8) | Unsplash License |

`alt` кожного зображення описує те, що реально видно на фото.

**Ліцензії, які підходять:**
- [Unsplash License](https://unsplash.com/license) — безкоштовне використання, зокрема
  комерційне; зазначати автора не обов'язково, але ми записуємо його тут.
  Не підходять фото з позначкою **Unsplash+** (платні).
- [Pexels License](https://www.pexels.com/license/) — безкоштовне використання; не можна
  продавати фото без змін чи видавати за власні.

## 2. Шрифти

| Шрифт | Автор | Джерело | Ліцензія |
|---|---|---|---|
| Lora | Cyreal | [Google Fonts](https://fonts.google.com/specimen/Lora) | SIL Open Font License 1.1 |
| Manrope | Mikhail Sharanda | [Google Fonts](https://fonts.google.com/specimen/Manrope) | SIL Open Font License 1.1 |

З ПР 9 React-версія підключає шрифти з власного сервера: файли `client/app/public/fonts/*.woff2`
(змінні шрифти, підмножини «кирилиця» і «латиниця») завантажено з Google Fonts без змін.
Ліцензія OFL 1.1 дозволяє вбудовувати й поширювати шрифти разом із сайтом. Статична версія
(`client/static/`) і далі підключає їх з Google Fonts.

## 3. Графіка

Усі SVG у `client/assets/` (логотип, орнамент, значки регіонів, петриківка, лоадер) —
**власні**, намальовані для цього проєкту в ПР 3 (див. [DESIGN.md](DESIGN.md), розділ 6).

## 4. Мапа

Мапа на сторінці «Контакти» — вбудована мапа [OpenStreetMap](https://www.openstreetmap.org/).
Дані © [учасники OpenStreetMap](https://www.openstreetmap.org/copyright), ліцензія
Open Database License (ODbL). Підпис з авторством розміщено під мапою.
