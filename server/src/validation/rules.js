// Базові перевірки для серверної валідації. Кожна повертає текст помилки або null.
// Повідомлення ті самі, що й на клієнті, — людина бачить однаковий текст, хто б не знайшов помилку.

export const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isEmpty = (value) => value === undefined || value === null || value === '';

/** Рядок: обов'язковість, «лише пробіли», довжина після trim. */
export function checkString(value, { required = false, min = 0, max = Infinity } = {}) {
  if (isEmpty(value)) return required ? 'Заповніть це поле.' : null;
  if (typeof value !== 'string') return 'Очікується текст.';
  const length = value.trim().length;
  if (!length) return 'Поле не може складатися лише з пробілів.';
  if (length < min) return `Мінімум ${min} символів (зараз ${length}).`;
  if (length > max) return `Максимум ${max} символів.`;
  return null;
}

/** Число (саме number, не рядок): межі, ціле або з одним знаком після коми. */
export function checkNumber(value, { min, max, integer = false }) {
  if (isEmpty(value)) return 'Заповніть це поле.';
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Введіть число.';
  if (value < min || value > max) return `Введіть число від ${min} до ${max}.`;
  if (integer && !Number.isInteger(value)) return 'Введіть ціле число.';
  // 0.3 * 10 = 3.0000000000000004, тому порівнюємо з допуском
  if (!integer && Math.abs(Math.round(value * 10) - value * 10) > 1e-9) return 'Не більше одного знака після коми.';
  return null;
}

export const checkOneOf = (value, allowed, message = 'Оберіть варіант зі списку.') => (allowed.includes(value) ? null : message);

export const trimString = (value) => (typeof value === 'string' ? value.trim() : value);

/** Збирач помилок: add(field, message) додає лише непорожні повідомлення. */
export function createErrors() {
  const details = [];
  return {
    details,
    add(field, message) {
      if (message) details.push({ field, message });
    },
  };
}
