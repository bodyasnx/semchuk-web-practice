// Обробники в кінці ланцюжка middleware.

/** 404 для будь-якого шляху, який не обробив жоден маршрут (JSON замість HTML-сторінки Express). */
export function notFound(req, res) {
  res.status(404).json({ error: `Шлях ${req.method} ${req.originalUrl} не знайдено.` });
}

/**
 * Централізований обробник помилок — Express впізнає його за 4 параметрами (err, req, res, next).
 * Сюди потрапляють винятки з маршрутів (в Express 5 — і з async-функцій) та помилки express.json.
 */
// next не використовується, але без нього Express не розпізнає обробник помилок
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некоректний JSON у тілі запиту.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Тіло запиту завелике (максимум 100 КБ).' });
  }
  // Подробиці — лише в журнал сервера: клієнту не показуємо шляхи до файлів і стек викликів
  console.error(err);
  return res.status(500).json({ error: 'Внутрішня помилка сервера. Спробуйте пізніше.' });
}
