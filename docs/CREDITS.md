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
| Вареники з вишнями | `varenyky-vyshni` | див. посилання | [Unsplash](https://unsplash.com/photos/a-white-plate-topped-with-dumplings-covered-in-cheese-and-cranberries-g7jXqoeLST0) | Unsplash License |
| Полтавські галушки | `halushky` | див. посилання | [Unsplash](https://unsplash.com/photos/a-bowl-of-delicious-soup-is-served-YAjDHgZH1M0) | Unsplash License |
| Голубці | `holubtsi` | див. посилання | [Unsplash](https://unsplash.com/photos/brown-and-white-garlic-on-black-ceramic-plate-xKrZXq9etDU) | Unsplash License |
| Деруни | `deruny` | див. посилання | [Pexels](https://www.pexels.com/photo/polish-potato-pancakes-with-sour-cream-37645636/) | Pexels License |
| Банош із бринзою | `banosh` | див. посилання | [Unsplash](https://unsplash.com/photos/cooked-food-on-white-ceramic-plate-x_ObRUc51S0) | Unsplash License |
| Пампушки з часником | `pampushky` | див. посилання | [Unsplash](https://unsplash.com/photos/freshly-baked-rolls-sit-on-floral-paper-seeeZ5pQrQA) | Unsplash License |
| Сирники | `syrnyky` | Max Nayman | [Unsplash](https://unsplash.com/photos/brown-and-white-pastry-on-white-ceramic-plate-hrGZ8nQD3QM) | Unsplash License |
| Узвар | `uzvar` | див. посилання | [Unsplash](https://unsplash.com/photos/glass-pitcher-and-apples-on-table-imEqHThoix8) | Unsplash License |

**Відповідність фото рецептам.** `alt` описує те, що реально видно на фото. Кілька фото
лише приблизно відповідають страві — їх варто замінити, коли знайдеться точніше вільне фото:

| `<id>` | Що на фото насправді |
|---|---|
| `banosh` | Тушковане м'ясо на кістці на кукурудзяній каші — схоже на осо-буко на поленті, а не на банош |
| `holubtsi` | Капустяні й виноградні голубці (долма) з лаймом |
| `varenyky-vyshni` | Вареники з журавлиною, а не з вишнями |
| `pampushky` | Булочки, запечені з сиром; часникової заправки не видно |
| `halushky` | Тісто в бульйоні з зеленою цибулею, без шкварок |

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

## 3. Графіка

Усі SVG у `client/assets/` (логотип, орнамент, значки регіонів, петриківка, лоадер) —
**власні**, намальовані для цього проєкту в ПР 3 (див. [DESIGN.md](DESIGN.md), розділ 6).

## 4. Мапа

Мапа на сторінці «Контакти» — вбудована мапа [OpenStreetMap](https://www.openstreetmap.org/).
Дані © [учасники OpenStreetMap](https://www.openstreetmap.org/copyright), ліцензія
Open Database License (ODbL). Підпис з авторством розміщено під мапою.
