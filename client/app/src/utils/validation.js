// Правила валідації форм — чисті функції без React: значення форми → { шлях поля: повідомлення }.
// Порожній об'єкт означає, що форма коректна. Ті самі правила перевіряє сервер
// (server/src/validation/) — клієнтська перевірка лише швидша і зручніша для людини.
import { MIN_SERVINGS, MAX_SERVINGS } from './servings.js';

export const UNITS = ['г', 'кг', 'мл', 'л', 'шт', 'ст. л.', 'ч. л.', 'зубчик', 'за смаком'];
export const PHONE_PATTERN = /^\+380\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/** Текстове поле: обов'язковість, «лише пробіли», довжина. Повертає повідомлення або null. */
export function checkText(value, { required = false, min = 0, max = Infinity } = {}) {
  const trimmed = value.trim();
  if (!value) return required ? 'Заповніть це поле.' : null;
  if (!trimmed) return 'Поле не може складатися лише з пробілів.';
  if (trimmed.length < min) return `Мінімум ${min} символів (зараз ${trimmed.length}).`;
  if (trimmed.length > max) return `Максимум ${max} символів.`;
  return null;
}

/** Числове поле (значення — рядок з input): обов'язковість, межі, ціле чи з одним знаком після коми. */
export function checkNumber(value, { required = false, min, max, integer = false } = {}) {
  if (value === '') return required ? 'Заповніть це поле.' : null;
  const number = Number(value);
  if (Number.isNaN(number)) return 'Введіть число.';
  if (number < min || number > max) return `Введіть число від ${min} до ${max}.`;
  if (integer && !Number.isInteger(number)) return 'Введіть ціле число.';
  // 0.3 * 10 = 3.0000000000000004 у двійковій арифметиці, тому порівнюємо з допуском
  if (!integer && Math.abs(Math.round(number * 10) - number * 10) > 1e-9) return 'Не більше одного знака після коми.';
  return null;
}

function checkImage(file) {
  if (!file) return null;
  if (!IMAGE_TYPES.includes(file.type)) return 'Оберіть файл WebP, JPEG або PNG.';
  if (file.size > MAX_IMAGE_SIZE) return 'Файл більший за 2 МБ — стисніть фото.';
  return null;
}

/**
 * Кількість інгредієнта (крім «за смаком»): для заповненого рядка обов'язкова і більша за 0 —
 * інакше перерахунок порцій не матиме з чим працювати. Порожній рядок не перевіряємо.
 */
function checkIngredientAmount(row) {
  if (row.amount === '') return row.name.trim() ? 'Вкажіть кількість або оберіть одиницю «за смаком».' : null;
  return checkNumber(row.amount, { min: 0, max: 10000 }) ?? (Number(row.amount) > 0 ? null : 'Кількість має бути більшою за 0.');
}

/** Додає помилку, лише якщо вона є, — щоб у результаті не було ключів зі значенням null. */
function collect(errors, path, message) {
  if (message) errors[path] = message;
}

/** Форма «Додати рецепт». Помилки рядків прив'язані до key рядка, а не до номера. */
export function validateRecipe(values) {
  const errors = {};
  collect(errors, 'title', checkText(values.title, { required: true, min: 3, max: 100 }));
  if (!values.category) errors.category = 'Оберіть варіант зі списку.';
  collect(errors, 'description', checkText(values.description, { max: 300 }));
  collect(errors, 'servings', checkNumber(values.servings, { required: true, min: MIN_SERVINGS, max: MAX_SERVINGS, integer: true }));
  collect(errors, 'cookTime', checkNumber(values.cookTime, { required: true, min: 1, max: 1440, integer: true }));
  if (!values.difficulty) errors.difficulty = 'Оберіть один із варіантів.';
  collect(errors, 'image', checkImage(values.image));

  values.ingredients.forEach((row, index) => {
    const path = `ingredients.${row.key}`;
    const nameError = checkText(row.name, { required: index === 0, min: 2, max: 60 });
    collect(errors, `${path}.name`, nameError ?? (!row.name.trim() && row.amount !== '' ? 'Вкажіть назву інгредієнта.' : null));
    if (row.unit === 'за смаком') {
      if (row.amount !== '') errors[`${path}.amount`] = 'Для «за смаком» залиште кількість порожньою.';
    } else {
      collect(errors, `${path}.amount`, checkIngredientAmount(row));
    }
  });

  values.steps.forEach((row, index) => {
    collect(errors, `steps.${row.key}`, checkText(row.text, { required: index === 0, min: 10, max: 500 }));
  });

  if (!values.rights) errors.rights = 'Потрібна ваша згода.';
  return errors;
}

/** Форма зворотного зв'язку (поля — як у ContactMessage з TZ.md, розділ 7). */
export function validateContact(values) {
  const errors = {};
  collect(errors, 'name', checkText(values.name, { required: true, min: 2, max: 50 }));
  const emailError = checkText(values.email, { required: true, max: 100 });
  collect(errors, 'email', emailError ?? (EMAIL_PATTERN.test(values.email.trim()) ? null : 'Введіть email у форматі name@example.com.'));
  if (values.phone && !PHONE_PATTERN.test(values.phone)) {
    errors.phone = 'Введіть телефон у форматі +380XXXXXXXXX: «+380» і 9 цифр без пробілів.';
  }
  if (!values.topic) errors.topic = 'Оберіть варіант зі списку.';
  collect(errors, 'message', checkText(values.message, { required: true, min: 10, max: 1000 }));
  if (!values.consent) errors.consent = 'Потрібна ваша згода.';
  return errors;
}
