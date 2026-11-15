// Дрібні допоміжні функції, спільні для всіх модулів.

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Екранує текст перед вставкою в HTML-шаблон (захист від XSS, якщо дані прийдуть з сервера). */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Debounce: функція виконається лише через delay мс після ОСТАННЬОГО виклику.
 * Пошук не фільтрує список на кожну літеру, а чекає, поки людина перестане друкувати.
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Рядок для пошуку: нижній регістр, усі види апострофа зведені до одного. */
export function normalizeText(value) {
  return String(value).toLocaleLowerCase('uk').replace(/[’ʼ`]/g, "'").trim();
}
