// Дозволені адреси клієнта для CORS (змінна CLIENT_ORIGIN, кілька адрес через кому).
//
// Браузер надсилає заголовок Origin у вигляді «https://smak.netlify.app» — без шляху і без «/»
// у кінці. Тож адресу, скопійовану з адресного рядка («https://smak.netlify.app/»), нормалізуємо,
// інакше вона б ніколи не збіглася з Origin.
//
// «*» замінює частину ОДНОГО сегмента домену (літери, цифри, дефіс — без крапки). Це для
// попередніх переглядів Netlify (deploy previews) з адресами https://deploy-preview-5--smak.netlify.app:
// шаблон https://*--smak.netlify.app дозволяє лише їх. Шаблон https://*.netlify.app дозволив би
// БУДЬ-ЯКИЙ сайт на Netlify, тому його використовувати не варто.

const normalize = (origin) => origin.trim().replace(/\/+$/, '').toLowerCase();

/** 'http://a.com/, https://*--b.netlify.app' → ['http://a.com', 'https://*--b.netlify.app'] */
export function parseOrigins(value = '') {
  return value.split(',').map(normalize).filter(Boolean);
}

const escapeRegExp = (text) => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

function toRegExp(pattern) {
  return new RegExp(`^${pattern.split('*').map(escapeRegExp).join('[a-z0-9-]+')}$`);
}

/** Чи дозволено Origin з запиту. allowed — результат parseOrigins. */
export function isAllowedOrigin(origin, allowed) {
  const value = normalize(origin);
  return allowed.some((pattern) => (pattern.includes('*') ? toRegExp(pattern).test(value) : pattern === value));
}
