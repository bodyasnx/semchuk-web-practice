// Каталог: рендер карток з JSON і стани «завантаження», «помилка», «нічого не знайдено».
import { getRecipes } from './api.js';
import { recipeCardHtml, loadingHtml, errorHtml, emptyHtml } from './render.js';
import { plural } from './labels.js';

const CARD_SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 45vw, 100vw';

export function initCatalog() {
  const list = document.getElementById('recipe-list');
  const title = document.getElementById('results-title');
  const live = document.getElementById('results-live');
  if (!list) return;

  function renderResults(recipes) {
    const count = recipes.length;
    title.textContent = `Знайдено ${count} ${plural(count, ['рецепт', 'рецепти', 'рецептів'])}`;
    live.textContent = title.textContent;
    list.innerHTML = count
      ? recipes.map((recipe, index) => recipeCardHtml(recipe, { sizes: CARD_SIZES, lazy: index > 2 })).join('')
      : emptyHtml({
        title: 'Нічого не знайдено',
        text: 'Спробуйте змінити запит або скинути фільтри.',
        linkHref: 'recipes.html',
        linkText: 'Скинути фільтри',
      });
  }

  async function load() {
    list.setAttribute('aria-busy', 'true');
    list.innerHTML = loadingHtml();
    try {
      const recipes = await getRecipes();
      renderResults([...recipes].sort((a, b) => a.title.localeCompare(b.title, 'uk')));
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
