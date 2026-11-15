// Рядок для пошуку: нижній регістр, усі види апострофа зведені до одного (з static/js/utils.js).
export function normalizeText(value) {
  return String(value).toLocaleLowerCase('uk').replace(/[’ʼ`]/g, "'").trim();
}
