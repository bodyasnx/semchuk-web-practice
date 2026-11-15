// Підписи для значень з даних і форматування чисел, тривалості, відмінків.

export const CATEGORY_NAMES = {
  first: 'Перші страви',
  main: 'Другі страви',
  dumplings: 'Вареники та галушки',
  baking: 'Випічка',
  dessert: 'Десерти',
  drinks: 'Напої',
};

export const REGION_NAMES = {
  hutsulshchyna: 'Гуцульщина',
  poltavshchyna: 'Полтавщина',
  halychyna: 'Галичина',
  podillia: 'Поділля',
  slobozhanshchyna: 'Слобожанщина',
};

export const DIFFICULTY_NAMES = {
  easy: 'Легка',
  medium: 'Середня',
  hard: 'Складна',
};

/**
 * Українська множина: plural(5, ['порція', 'порції', 'порцій']) → 'порцій'.
 * Дробові числа (2,5) вживаються з формою родового відмінка однини: «2,5 порції».
 */
export function plural(count, [one, few, many]) {
  if (!Number.isInteger(count)) return few;
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** 120 → «2 год», 90 → «1 год 30 хв», 40 → «40 хв». */
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} хв`;
  return rest ? `${hours} год ${rest} хв` : `${hours} год`;
}

/** 120 → «PT2H», 90 → «PT1H30M» — формат ISO 8601 для <time datetime> і schema.org. */
export function isoDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `PT${hours ? `${hours}H` : ''}${rest ? `${rest}M` : ''}`;
}

/** «2026-11-14» → «14 листопада 2026 р.» */
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Число з комою і не більше одного знака після неї: 2.5 → «2,5», 1250 → «1 250». */
export function formatNumber(value) {
  return value.toLocaleString('uk-UA', { maximumFractionDigits: 1 });
}

/** Одиниця виміру з правильним закінченням: «3 зубчики», «7,5 зубчика». */
export function formatUnit(unit, amount) {
  if (unit === 'зубчик') return plural(amount, ['зубчик', 'зубчики', 'зубчиків']);
  return unit;
}

export function servingsWord(count) {
  return plural(count, ['порція', 'порції', 'порцій']);
}
