// Пошук, фільтрація і сортування рецептів за параметрами запиту GET /api/recipes.
// Логіка перенесена з клієнта (client/app/src/utils/catalog.js): тепер фільтрує сервер.

const normalizeText = (value) => String(value).toLocaleLowerCase('uk').replace(/[’ʼ`]/g, "'").trim();

const TIME_FILTERS = {
  30: (minutes) => minutes <= 30,
  60: (minutes) => minutes > 30 && minutes <= 60,
  long: (minutes) => minutes > 60,
};

const byTitle = (a, b) => a.title.localeCompare(b.title, 'uk');
export const SORTERS = {
  'title-asc': byTitle,
  'title-desc': (a, b) => byTitle(b, a),
  'time-asc': (a, b) => a.cookTime - b.cookTime || byTitle(a, b),
  'time-desc': (a, b) => b.cookTime - a.cookTime || byTitle(a, b),
  'newest': (a, b) => b.createdAt.localeCompare(a.createdAt) || byTitle(a, b),
};

/** Значення параметра як масив: ?category=a&category=b і ?category=a,b дають ['a', 'b']. */
const toList = (value) => [value].flat().filter(Boolean).flatMap((item) => String(item).split(','));

/** query — об'єкт req.query: { q, category, region, time, sort }. */
export function queryRecipes(recipes, query) {
  const q = normalizeText(query.q ?? '');
  const categories = toList(query.category);
  const region = query.region ?? '';
  const time = TIME_FILTERS[query.time];
  const sorter = SORTERS[query.sort] ?? SORTERS['title-asc'];

  return recipes
    .filter((recipe) => {
      if (q) {
        const haystack = [recipe.title, ...recipe.ingredients.map((item) => item.name)].map(normalizeText);
        if (!haystack.some((text) => text.includes(q))) return false;
      }
      if (categories.length && !categories.includes(recipe.category)) return false;
      if (region && recipe.region !== region) return false;
      if (time && !time(recipe.cookTime)) return false;
      return true;
    })
    .sort(sorter);
}
