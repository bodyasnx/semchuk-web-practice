// Чистий модуль перерахунку порцій: без DOM, лише обчислення (легко тестувати, ПР 9).
// Правила округлення — розділ 8 docs/TZ.md, з мінімумами, щоб не виходило «0 г» чи «0 ложок».

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 20;

const roundToHalf = (value) => Math.round(value * 2) / 2;
const roundToTenth = (value) => Math.round(value * 10) / 10;

/**
 * Перераховує кількість інгредієнта з base порцій на target порцій.
 * Повертає null для «за смаком» (amount === null) — така кількість не перераховується.
 *
 * Округлення за одиницею:
 *   г, мл         — до цілого; якщо більше 100 — до 5; мінімум 1
 *   кг, л         — до 0,1; мінімум 0,1
 *   шт, зубчик    — до 0,5; мінімум 0,5 (не можна взяти 0 яєць)
 *   ст. л., ч. л. — до 0,5; мінімум 0,5
 */
export function scaleAmount(amount, unit, base, target) {
  if (amount === null || unit === 'за смаком') return null;
  if (!(base > 0) || !(target > 0)) throw new RangeError('Кількість порцій має бути додатною');

  const raw = (amount * target) / base;
  switch (unit) {
    case 'г':
    case 'мл':
      return Math.max(1, raw > 100 ? Math.round(raw / 5) * 5 : Math.round(raw));
    case 'кг':
    case 'л':
      return Math.max(0.1, roundToTenth(raw));
    case 'шт':
    case 'зубчик':
    case 'ст. л.':
    case 'ч. л.':
      return Math.max(0.5, roundToHalf(raw));
    default:
      return roundToTenth(raw);
  }
}

/** Перераховує весь список інгредієнтів, не змінюючи вихідний масив. */
export function scaleIngredients(ingredients, base, target) {
  return ingredients.map((item) => ({ ...item, amount: scaleAmount(item.amount, item.unit, base, target) }));
}

/**
 * Приводить введене значення до допустимого: ціле число в межах 1–20.
 * Повертає { value, reason }, де reason — чому значення виправлено (або null).
 */
export function normalizeServings(input, fallback) {
  const number = Number(String(input).replace(',', '.'));
  if (String(input).trim() === '' || Number.isNaN(number)) return { value: fallback, reason: 'empty' };
  if (number < MIN_SERVINGS) return { value: MIN_SERVINGS, reason: 'min' };
  if (number > MAX_SERVINGS) return { value: MAX_SERVINGS, reason: 'max' };
  if (!Number.isInteger(number)) return { value: Math.round(number), reason: 'fraction' };
  return { value: number, reason: null };
}
