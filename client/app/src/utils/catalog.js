// Логіка каталогу без React: стан фільтрів ↔ параметри адреси, фільтрація і сортування.
// Перенесено з static/js/catalog.js; чисті функції — їх легко покрити тестами (ПР 9).
import { normalizeText } from './text.js';

export const DEFAULT_SORT = 'title-asc';

const TIME_FILTERS = {
  30: (minutes) => minutes <= 30,
  60: (minutes) => minutes > 30 && minutes <= 60,
  long: (minutes) => minutes > 60,
};

const SORTERS = {
  'title-asc': (a, b) => a.title.localeCompare(b.title, 'uk'),
  'title-desc': (a, b) => b.title.localeCompare(a.title, 'uk'),
  'time-asc': (a, b) => a.cookTime - b.cookTime || a.title.localeCompare(b.title, 'uk'),
  'time-desc': (a, b) => b.cookTime - a.cookTime || a.title.localeCompare(b.title, 'uk'),
};

export const SORT_OPTIONS = [
  { value: 'title-asc', label: 'За назвою (А–Я)' },
  { value: 'title-desc', label: 'За назвою (Я–А)' },
  { value: 'time-asc', label: 'За часом: спочатку швидкі' },
  { value: 'time-desc', label: 'За часом: спочатку довгі' },
];

export const TIME_OPTIONS = [
  { value: '', label: 'Будь-який' },
  { value: '30', label: 'До 30 хв' },
  { value: '60', label: '30–60 хв' },
  { value: 'long', label: 'Понад 60 хв' },
];

/** URLSearchParams → об'єкт фільтрів. */
export function readFilters(params) {
  const sort = params.get('sort');
  return {
    q: params.get('q') ?? '',
    categories: params.getAll('category'),
    region: params.get('region') ?? '',
    time: params.get('time') ?? '',
    sort: SORTERS[sort] ? sort : DEFAULT_SORT,
  };
}

/** Об'єкт фільтрів → URLSearchParams (порожні значення не пишемо, щоб адреса була короткою). */
export function filtersToParams(filters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q);
  filters.categories.forEach((category) => params.append('category', category));
  if (filters.region) params.set('region', filters.region);
  if (filters.time) params.set('time', filters.time);
  if (filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort);
  return params;
}

/** Фільтрація за назвою/інгредієнтом, категорією, регіоном, часом і сортування. */
export function filterRecipes(recipes, filters) {
  const query = normalizeText(filters.q);
  return recipes
    .filter((recipe) => {
      if (query) {
        const haystack = [recipe.title, ...recipe.ingredients.map((item) => item.name)].map(normalizeText);
        if (!haystack.some((text) => text.includes(query))) return false;
      }
      if (filters.categories.length && !filters.categories.includes(recipe.category)) return false;
      if (filters.region && recipe.region !== filters.region) return false;
      if (filters.time && TIME_FILTERS[filters.time] && !TIME_FILTERS[filters.time](recipe.cookTime)) return false;
      return true;
    })
    .sort(SORTERS[filters.sort]);
}

export function activeFiltersCount(filters) {
  return (filters.q.trim() ? 1 : 0) + filters.categories.length + (filters.region ? 1 : 0) + (filters.time ? 1 : 0);
}
