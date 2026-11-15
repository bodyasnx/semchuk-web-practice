// Точка входу: за атрибутом <body data-page="…"> запускає код потрібної сторінки.
import { initHome } from './home.js';
import { initCatalog } from './catalog.js';
import { initRecipe } from './recipe.js';

const pages = {
  home: initHome,
  catalog: initCatalog,
  recipe: initRecipe,
};

const page = document.body.dataset.page;
pages[page]?.();
