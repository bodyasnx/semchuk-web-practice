// Точка входу: спільні модулі (тема, меню) + код потрібної сторінки за атрибутом <body data-page="…">.
import { initTheme } from './theme.js';
import { initMenu } from './menu.js';
import { initHome } from './home.js';
import { initCatalog } from './catalog.js';
import { initRecipe } from './recipe.js';
import { initAddRecipeForm, initContactsForm } from './forms.js';

initTheme();
initMenu();

const pages = {
  home: initHome,
  catalog: initCatalog,
  recipe: initRecipe,
  'add-recipe': initAddRecipeForm,
  contacts: initContactsForm,
};

pages[document.body.dataset.page]?.();
