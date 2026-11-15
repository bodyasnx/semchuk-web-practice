// Головна: блок «Популярні рецепти» рендериться з JSON.
import { getRecipes } from './api.js';
import { recipeCardHtml, loadingHtml, errorHtml } from './render.js';

const POPULAR_IDS = ['borshch', 'varenyky-kartoplia', 'deruny', 'banosh'];
const CARD_SIZES = '(min-width: 1280px) 280px, (min-width: 768px) 45vw, 100vw';

export function initHome() {
  const list = document.getElementById('popular-list');
  if (!list) return;

  async function load() {
    list.setAttribute('aria-busy', 'true');
    list.innerHTML = loadingHtml();
    try {
      const recipes = await getRecipes();
      const popular = POPULAR_IDS.map((id) => recipes.find((recipe) => recipe.id === id)).filter(Boolean);
      list.innerHTML = popular.map((recipe) => recipeCardHtml(recipe, { compact: true, sizes: CARD_SIZES })).join('');
    } catch (error) {
      list.innerHTML = errorHtml(error.message);
    } finally {
      list.removeAttribute('aria-busy');
    }
  }

  // Кнопка «Спробувати ще» з'являється динамічно — ловимо клік на контейнері (делегування)
  list.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="retry"]')) load();
  });

  load();
}
