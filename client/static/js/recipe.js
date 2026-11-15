// Сторінка рецепта: recipe.html?id=<id> будує потрібний рецепт з JSON; невідомий id — стан 404.
import { getRecipes } from './api.js';
import { escapeHtml } from './utils.js';
import { pictureHtml, regionBadgeHtml, loadingHtml, errorHtml, emptyHtml } from './render.js';
import {
  CATEGORY_NAMES, DIFFICULTY_NAMES, formatDuration, isoDuration, formatDate, formatNumber, formatUnit, servingsWord,
} from './labels.js';

const PHOTO_SIZES = '(min-width: 1280px) 700px, 100vw';

/** Рядки інгредієнтів; кількість — у <data value>, щоб її зручно було перераховувати. */
export function ingredientItemsHtml(ingredients) {
  return ingredients.map(({ name, amount, unit }) => {
    const value = amount === null
      ? 'за смаком'
      : `<data value="${amount}">${formatNumber(amount)}</data> ${formatUnit(unit, amount)}`;
    return `<li><span class="ingredient__name">${escapeHtml(name)}</span> — <span class="ingredient__amount">${value}</span></li>`;
  }).join('');
}

function recipeHtml(recipe) {
  const credit = recipe.imageCredit;
  const creditAuthor = credit.author ? `${escapeHtml(credit.author)}, ` : '';
  return `<header class="recipe__header">
      <h1>${escapeHtml(recipe.title)}</h1>
      <p class="lead">${escapeHtml(recipe.description)}</p>
      <dl class="recipe-facts">
        <dt>Категорія</dt>
        <dd><a href="recipes.html?category=${recipe.category}">${CATEGORY_NAMES[recipe.category]}</a></dd>
        <dt>Регіон</dt>
        <dd class="badge-region badge-region--${recipe.region}">${regionBadgeHtml(recipe.region)}</dd>
        <dt>Час приготування</dt>
        <dd><time datetime="${isoDuration(recipe.cookTime)}">${formatDuration(recipe.cookTime)}</time></dd>
        <dt>Складність</dt>
        <dd>${DIFFICULTY_NAMES[recipe.difficulty]}</dd>
        <dt>Базова кількість порцій</dt>
        <dd>${recipe.servings}</dd>
        <dt>Опубліковано</dt>
        <dd><time datetime="${recipe.createdAt}">${formatDate(recipe.createdAt)}</time></dd>
      </dl>
    </header>

    <figure class="recipe__photo">
      ${pictureHtml(recipe, { sizes: PHOTO_SIZES, lazy: false, priority: true })}
      <figcaption>Фото: ${creditAuthor}<a href="${escapeHtml(credit.url)}">${credit.source}</a>, ${credit.license}.</figcaption>
    </figure>

    <section class="recipe__ingredients" aria-labelledby="ingredients-title">
      <h2 id="ingredients-title">Інгредієнти</h2>
      <div data-servings-slot>
        <p class="servings-status">На ${recipe.servings} ${servingsWord(recipe.servings)}.</p>
      </div>
      <ul id="ingredients-list" class="ingredients">${ingredientItemsHtml(recipe.ingredients)}</ul>
    </section>

    <section class="recipe__steps" aria-labelledby="steps-title">
      <h2 id="steps-title">Приготування</h2>
      <ol class="steps">${recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    </section>

    <footer class="recipe__footer">
      <p class="actions">
        <a class="btn btn--secondary" href="add-recipe.html">Редагувати рецепт</a>
        <button class="btn btn--danger" type="button" data-action="delete">Видалити рецепт</button>
      </p>
    </footer>`;
}

function setMeta(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('content', value);
}

/** Оновлює title, description, Open Graph і JSON-LD під конкретний рецепт. */
function updateHead(recipe) {
  const title = `${recipe.title} — покроковий рецепт | Смак Традиції`;
  const description = `${recipe.description} Інгредієнти на 1–20 порцій і ${recipe.steps.length} кроків. Час — ${formatDuration(recipe.cookTime)}.`;
  document.title = title;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', recipe.description);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    recipeCategory: CATEGORY_NAMES[recipe.category],
    recipeCuisine: 'Українська',
    datePublished: recipe.createdAt,
    totalTime: isoDuration(recipe.cookTime),
    recipeYield: `${recipe.servings} ${servingsWord(recipe.servings)}`,
    recipeIngredient: recipe.ingredients.map(({ name, amount, unit }) =>
      (amount === null ? `${name} за смаком` : `${formatNumber(amount)} ${formatUnit(unit, amount)} — ${name}`)),
    recipeInstructions: recipe.steps.map((text) => ({ '@type': 'HowToStep', text })),
  };
  let script = document.getElementById('recipe-jsonld');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'recipe-jsonld';
    document.head.append(script);
  }
  script.textContent = JSON.stringify(jsonLd);
}

function setBreadcrumb(text) {
  const current = document.querySelector('.breadcrumbs [aria-current="page"]');
  if (current) current.textContent = text;
}

/** Блок «Схожі рецепти»: спершу та сама категорія, потім той самий регіон. */
function renderRelated(recipe, recipes) {
  const aside = document.getElementById('related');
  const list = document.getElementById('related-list');
  if (!aside || !list) return;
  const others = recipes.filter((item) => item.id !== recipe.id);
  const score = (item) => (item.category === recipe.category ? 2 : 0) + (item.region === recipe.region ? 1 : 0);
  const related = others.sort((a, b) => score(b) - score(a)).slice(0, 3);
  list.innerHTML = related
    .map((item) => `<li><a class="chip" href="recipe.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.title)}</a></li>`)
    .join('');
  aside.hidden = false;
}

function renderNotFound(root, id) {
  document.title = 'Рецепт не знайдено — Смак Традиції';
  setMeta('meta[name="description"]', 'Такого рецепта немає в каталозі «Смак Традиції».');
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.name = 'robots';
    document.head.append(robots);
  }
  robots.content = 'noindex';
  setBreadcrumb('Рецепт не знайдено');
  root.innerHTML = emptyHtml({
    title: 'Рецепт не знайдено',
    text: id
      ? `Рецепта з адресою «${escapeHtml(id)}» немає в каталозі — можливо, його видалили або посилання неповне.`
      : 'В адресі сторінки не вказано, який рецепт відкрити.',
    linkHref: 'recipes.html',
    linkText: 'До каталогу рецептів',
    headingLevel: 1,
  });
}

/** Викликається після рендеру рецепта (ПР 6, коміт 2 — перемикач порцій). */
let onRecipeRendered = () => {};
export function setRecipeRenderedHandler(handler) {
  onRecipeRendered = handler;
}

export function initRecipe() {
  const root = document.getElementById('recipe-root');
  if (!root) return;
  const id = new URLSearchParams(window.location.search).get('id');

  async function load() {
    root.setAttribute('aria-busy', 'true');
    root.innerHTML = `<h1 class="visually-hidden">Рецепт</h1>${loadingHtml('Завантаження рецепта…')}`;
    try {
      const recipes = await getRecipes();
      const recipe = id ? recipes.find((item) => item.id === id) : null;
      if (!recipe) {
        renderNotFound(root, id);
        return;
      }
      root.innerHTML = recipeHtml(recipe);
      updateHead(recipe);
      setBreadcrumb(recipe.title);
      renderRelated(recipe, recipes);
      onRecipeRendered(recipe, root);
    } catch (error) {
      root.innerHTML = `<h1>Не вдалося відкрити рецепт</h1>${errorHtml(error.message)}`;
    } finally {
      root.removeAttribute('aria-busy');
    }
  }

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="retry"]')) load();
  });

  load();
}
