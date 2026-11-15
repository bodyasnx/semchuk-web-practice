// Валідація рецепта — правила з docs/TZ.md (розділ 7) і клієнтської форми.
// Повертає { details, value }: details — масив помилок по полях (порожній, якщо все добре),
// value — очищений рецепт лише з дозволеними полями (рядки без зайвих пробілів).
import { isPlainObject, checkString, checkNumber, checkOneOf, trimString, createErrors } from './rules.js';

export const CATEGORIES = ['first', 'main', 'dumplings', 'baking', 'dessert', 'drinks'];
export const REGIONS = ['hutsulshchyna', 'poltavshchyna', 'halychyna', 'podillia', 'slobozhanshchyna'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const UNITS = ['г', 'кг', 'мл', 'л', 'шт', 'ст. л.', 'ч. л.', 'зубчик', 'за смаком'];
const MAX_ROWS = 30;
const TO_TASTE = 'за смаком';

function checkAmount(amount, unit) {
  const empty = amount === undefined || amount === null || amount === '';
  if (unit === TO_TASTE) return empty ? null : 'Для «за смаком» залиште кількість порожньою.';
  if (empty) return 'Вкажіть кількість або оберіть одиницю «за смаком».';
  return checkNumber(amount, { min: 0, max: 10000 }) ?? (amount > 0 ? null : 'Кількість має бути більшою за 0.');
}

function validateIngredient(item, path, errors) {
  if (!isPlainObject(item)) {
    errors.add(path, 'Інгредієнт має бути об\'єктом { name, amount, unit }.');
    return null;
  }
  errors.add(`${path}.name`, checkString(item.name, { required: true, min: 2, max: 60 }));
  errors.add(`${path}.amount`, checkAmount(item.amount, item.unit));
  errors.add(`${path}.unit`, checkOneOf(item.unit, UNITS, 'Оберіть одиницю зі списку.'));
  return { name: trimString(item.name), amount: item.unit === TO_TASTE ? null : item.amount, unit: item.unit };
}

function validateList(list, field, emptyMessage, errors, validateItem) {
  if (!Array.isArray(list) || list.length === 0) {
    errors.add(field, emptyMessage);
    return [];
  }
  if (list.length > MAX_ROWS) errors.add(field, `Не більше ${MAX_ROWS} пунктів.`);
  return list.map((item, index) => validateItem(item, `${field}.${index}`));
}

export function validateRecipe(body) {
  const errors = createErrors();
  if (!isPlainObject(body)) {
    errors.add('body', 'Тіло запиту має бути JSON-об\'єктом рецепта.');
    return { details: errors.details, value: null };
  }

  errors.add('title', checkString(body.title, { required: true, min: 3, max: 100 }));
  errors.add('category', checkOneOf(body.category, CATEGORIES));
  if (body.region !== undefined && body.region !== null && body.region !== '') {
    errors.add('region', checkOneOf(body.region, REGIONS, 'Невідомий регіон.'));
  }
  errors.add('description', checkString(body.description, { max: 300 }));
  errors.add('servings', checkNumber(body.servings, { min: 1, max: 20, integer: true }));
  errors.add('cookTime', checkNumber(body.cookTime, { min: 1, max: 1440, integer: true }));
  errors.add('difficulty', checkOneOf(body.difficulty, DIFFICULTIES, 'Оберіть один із варіантів.'));

  const ingredients = validateList(body.ingredients, 'ingredients', 'Додайте хоча б один інгредієнт.', errors,
    (item, path) => validateIngredient(item, path, errors));
  const steps = validateList(body.steps, 'steps', 'Додайте хоча б один крок.', errors, (step, path) => {
    errors.add(path, checkString(step, { required: true, min: 10, max: 500 }));
    return trimString(step);
  });

  return {
    details: errors.details,
    value: {
      title: trimString(body.title),
      category: body.category,
      region: body.region || null,
      description: trimString(body.description) || '',
      servings: body.servings,
      cookTime: body.cookTime,
      difficulty: body.difficulty,
      ingredients,
      steps,
    },
  };
}
