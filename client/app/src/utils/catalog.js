// Стан фільтрів каталогу ↔ параметри адреси. Ті самі параметри йдуть у запит
// GET /api/recipes, а пошук, фільтрацію і сортування тепер виконує сервер (server/src/lib/query.js).

export const DEFAULT_SORT = 'title-asc';

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

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

/** URLSearchParams → об'єкт фільтрів. */
export function readFilters(params) {
  const sort = params.get('sort');
  return {
    q: params.get('q') ?? '',
    categories: params.getAll('category'),
    region: params.get('region') ?? '',
    time: params.get('time') ?? '',
    sort: SORT_VALUES.includes(sort) ? sort : DEFAULT_SORT,
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

export function activeFiltersCount(filters) {
  return (filters.q.trim() ? 1 : 0) + filters.categories.length + (filters.region ? 1 : 0) + (filters.time ? 1 : 0);
}
