// Валідація повідомлення зворотного зв'язку (ContactMessage з docs/TZ.md, розділ 7).
import { isPlainObject, checkString, checkOneOf, trimString, createErrors } from './rules.js';

export const TOPICS = ['question', 'recipe', 'bug', 'partnership', 'other'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+380\d{9}$/;

export function validateContact(body) {
  const errors = createErrors();
  if (!isPlainObject(body)) {
    errors.add('body', 'Тіло запиту має бути JSON-об\'єктом повідомлення.');
    return { details: errors.details, value: null };
  }

  const email = trimString(body.email);
  errors.add('name', checkString(body.name, { required: true, min: 2, max: 50 }));
  errors.add('email', checkString(email, { required: true, max: 100 })
    ?? (EMAIL_PATTERN.test(email) ? null : 'Введіть email у форматі name@example.com.'));
  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    const valid = typeof body.phone === 'string' && PHONE_PATTERN.test(body.phone);
    errors.add('phone', valid ? null : 'Введіть телефон у форматі +380XXXXXXXXX: «+380» і 9 цифр без пробілів.');
  }
  errors.add('topic', checkOneOf(body.topic, TOPICS));
  errors.add('message', checkString(body.message, { required: true, min: 10, max: 1000 }));
  errors.add('consent', body.consent === true ? null : 'Потрібна ваша згода.');

  return {
    details: errors.details,
    value: {
      name: trimString(body.name),
      email,
      phone: body.phone || null,
      topic: body.topic,
      message: trimString(body.message),
      newsletter: body.newsletter === true,
    },
  };
}
