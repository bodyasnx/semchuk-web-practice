// Дрібні допоміжні функції, спільні для всіх модулів.

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Екранує текст перед вставкою в HTML-шаблон (захист від XSS, якщо дані прийдуть з сервера). */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
