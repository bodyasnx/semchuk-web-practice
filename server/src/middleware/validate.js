// Middleware валідації тіла запиту: validator(body) → { details, value }.
// Є помилки — одразу 400 з переліком по полях і маршрут не виконується;
// немає — очищені дані кладемо в req.validBody і передаємо керування далі (next).
export function validateBody(validator) {
  return (req, res, next) => {
    const { details, value } = validator(req.body);
    if (details.length) {
      return res.status(400).json({ error: 'Перевірте дані форми.', details });
    }
    req.validBody = value;
    return next();
  };
}
