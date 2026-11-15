// Каталог: рендер з JSON, пошук з debounce, фільтри, сортування; стан фільтрів зберігається в URL,
// тож посилання «Напої» з головної (recipes.html?category=drinks) відкриває вже відфільтрований каталог.
import { getRecipes } from './api.js';
import { recipeCardHtml, loadingHtml, errorHtml, emptyHtml } from './render.js';
import { plural } from './labels.js';
import { debounce, normalizeText } from './utils.js';

const CARD_SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 45vw, 100vw';
const SEARCH_DELAY = 300;
const DEFAULT_SORT = 'title-asc';

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

/** Стан фільтрів з адреси сторінки. */
function readState(search) {
  const params = new URLSearchParams(search);
  const sort = params.get('sort');
  return {
    q: params.get('q') ?? '',
    categories: params.getAll('category'),
    region: params.get('region') ?? '',
    time: params.get('time') ?? '',
    sort: SORTERS[sort] ? sort : DEFAULT_SORT,
  };
}

/** Стан фільтрів → рядок запиту (порожні значення не пишемо, щоб адреса була короткою). */
function stateToSearch(state) {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set('q', state.q.trim());
  state.categories.forEach((category) => params.append('category', category));
  if (state.region) params.set('region', state.region);
  if (state.time) params.set('time', state.time);
  if (state.sort !== DEFAULT_SORT) params.set('sort', state.sort);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Чиста функція фільтрації й сортування — не залежить від DOM. */
export function filterRecipes(recipes, state) {
  const query = normalizeText(state.q);
  return recipes
    .filter((recipe) => {
      if (query) {
        const haystack = [recipe.title, ...recipe.ingredients.map((item) => item.name)].map(normalizeText);
        if (!haystack.some((text) => text.includes(query))) return false;
      }
      if (state.categories.length && !state.categories.includes(recipe.category)) return false;
      if (state.region && recipe.region !== state.region) return false;
      if (state.time && TIME_FILTERS[state.time] && !TIME_FILTERS[state.time](recipe.cookTime)) return false;
      return true;
    })
    .sort(SORTERS[state.sort]);
}

function activeFiltersCount(state) {
  return (state.q.trim() ? 1 : 0) + state.categories.length + (state.region ? 1 : 0) + (state.time ? 1 : 0);
}

export function initCatalog() {
  const list = document.getElementById('recipe-list');
  const title = document.getElementById('results-title');
  const live = document.getElementById('results-live');
  const filtersForm = document.querySelector('.filters form');
  const filtersDetails = document.querySelector('.filters');
  const sortForm = document.querySelector('.sort');
  if (!list || !filtersForm || !sortForm) return;

  const search = filtersForm.elements.q;
  const sortSelect = sortForm.elements.sort;
  const countBadge = document.createElement('span');
  countBadge.className = 'filters__count';
  filtersDetails.querySelector('summary h2').append(countBadge);

  // Зміни застосовуються одразу, тож кнопка «Сортувати» з JS не потрібна (без JS форма працює як звичайна)
  sortForm.querySelector('button[type="submit"]').hidden = true;

  let recipes = [];
  let state = readState(window.location.search);

  function syncForm() {
    search.value = state.q;
    filtersForm.querySelectorAll('input[name="category"]').forEach((box) => { box.checked = state.categories.includes(box.value); });
    filtersForm.elements.region.value = state.region;
    filtersForm.querySelectorAll('input[name="time"]').forEach((radio) => { radio.checked = radio.value === state.time; });
    sortSelect.value = state.sort;
  }

  function readForm() {
    return {
      q: search.value,
      categories: [...filtersForm.querySelectorAll('input[name="category"]:checked')].map((box) => box.value),
      region: filtersForm.elements.region.value,
      time: filtersForm.querySelector('input[name="time"]:checked')?.value ?? '',
      sort: sortSelect.value,
    };
  }

  function render() {
    const found = filterRecipes(recipes, state);
    const count = found.length;
    title.textContent = `Знайдено ${count} ${plural(count, ['рецепт', 'рецепти', 'рецептів'])}`;
    live.textContent = title.textContent;
    const active = activeFiltersCount(state);
    countBadge.textContent = active ? ` · ${active}` : '';
    list.innerHTML = count
      ? found.map((recipe, index) => recipeCardHtml(recipe, { sizes: CARD_SIZES, lazy: index > 2 })).join('')
      : emptyHtml({
        title: 'Нічого не знайдено',
        text: 'Спробуйте змінити запит або скинути фільтри.',
        linkHref: 'recipes.html',
        linkText: 'Скинути фільтри',
      });
  }

  /** Оновлює стан, адресу сторінки (без нового запису в історії) і список. */
  function update(nextState) {
    state = nextState;
    window.history.replaceState(null, '', `${window.location.pathname}${stateToSearch(state)}`);
    render();
  }

  const updateFromForm = () => update(readForm());
  const updateSearchDebounced = debounce(updateFromForm, SEARCH_DELAY);

  // Делегування: один обробник на всі поля форми фільтрів
  filtersForm.addEventListener('input', (event) => {
    if (event.target === search) updateSearchDebounced();
  });
  filtersForm.addEventListener('change', (event) => {
    if (event.target !== search) updateFromForm();
  });
  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateFromForm();
    // на телефоні після «Застосувати» згортаємо панель і показуємо результати
    if (window.matchMedia('(max-width: 1279px)').matches) {
      filtersDetails.open = false;
      title.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  filtersForm.addEventListener('reset', () => {
    // подія reset спрацьовує ДО очищення полів, тому читаємо форму в наступному кадрі
    requestAnimationFrame(updateFromForm);
  });
  sortForm.addEventListener('change', updateFromForm);
  sortForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateFromForm();
  });

  async function load() {
    list.setAttribute('aria-busy', 'true');
    list.innerHTML = loadingHtml();
    try {
      recipes = await getRecipes();
      syncForm();
      render();
    } catch (error) {
      title.textContent = 'Рецепти';
      list.innerHTML = errorHtml(error.message);
    } finally {
      list.removeAttribute('aria-busy');
    }
  }

  list.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="retry"]')) load();
  });

  load();
}
