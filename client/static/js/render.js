// HTML-шаблони: картка рецепта, фото, стани «завантаження», «помилка», «нічого не знайдено».
import { escapeHtml } from './utils.js';
import {
  CATEGORY_NAMES, REGION_NAMES, DIFFICULTY_NAMES, formatDuration, isoDuration, formatNumber, formatUnit,
} from './labels.js';

/** Адаптивне фото: WebP 480/800/1200 + JPG-запас; шляхи виводяться з поля image («…-800.webp»). */
export function pictureHtml(recipe, { sizes, lazy = true, priority = false }) {
  const base = recipe.image.replace(/-800\.webp$/, '');
  const loading = lazy ? ' loading="lazy"' : '';
  const fetchPriority = priority ? ' fetchpriority="high"' : '';
  return `<picture>
      <source type="image/webp" srcset="${base}-480.webp 480w, ${base}-800.webp 800w, ${base}-1200.webp 1200w" sizes="${sizes}">
      <img src="${base}-800.jpg" alt="${escapeHtml(recipe.imageAlt)}" width="800" height="600"${loading}${fetchPriority} decoding="async">
    </picture>`;
}

export function regionBadgeHtml(region) {
  return `<img class="badge-region__icon" src="../assets/region-${region}.svg" alt="" width="18" height="18"> ${REGION_NAMES[region]}`;
}

/**
 * Картка рецепта. compact — для головної (без категорії й порцій).
 * Заголовок першим у DOM (для скрінрідера), фото візуально піднімається вгору через CSS order.
 */
export function recipeCardHtml(recipe, { compact = false, lazy = true, sizes } = {}) {
  const id = encodeURIComponent(recipe.id);
  return `<article class="recipe-card">
    <h3 class="recipe-card__title"><a class="recipe-card__link" href="recipe.html?id=${id}">${escapeHtml(recipe.title)}</a></h3>
    ${pictureHtml(recipe, { sizes, lazy })}
    <p class="recipe-card__desc">${escapeHtml(recipe.description)}</p>
    <dl class="recipe-card__meta">
      ${compact ? '' : `<dt>Категорія</dt><dd>${CATEGORY_NAMES[recipe.category]}</dd>`}
      <dt>Регіон</dt>
      <dd class="badge-region badge-region--${recipe.region}">${regionBadgeHtml(recipe.region)}</dd>
      <dt>Час</dt>
      <dd><time datetime="${isoDuration(recipe.cookTime)}">${formatDuration(recipe.cookTime)}</time></dd>
      <dt>Складність</dt>
      <dd>${DIFFICULTY_NAMES[recipe.difficulty]}</dd>
      ${compact ? '' : `<dt>Порції</dt><dd>${recipe.servings}</dd>`}
    </dl>
  </article>`;
}

export function loadingHtml(text = 'Завантаження рецептів…') {
  return `<div class="state" role="status">
    <img class="state__loader" src="../assets/star-loader.svg" alt="" width="48" height="48">
    <p>${text}</p>
  </div>`;
}

/** Помилка завантаження з кнопкою повтору (обробник кнопки вішає сторінка через data-action="retry"). */
export function errorHtml(message) {
  return `<div class="state state--error" role="alert">
    <p><strong>Не вдалося завантажити рецепти.</strong> ${escapeHtml(message)}</p>
    <button class="btn btn--primary" type="button" data-action="retry">Спробувати ще</button>
  </div>`;
}

export function emptyHtml({ title, text, linkHref, linkText, headingLevel = 3 }) {
  return `<div class="empty-state">
    <img src="../assets/petrykivka.svg" alt="" width="240" height="200">
    <h${headingLevel} class="empty-state__title">${title}</h${headingLevel}>
    <p>${text}</p>
    ${linkHref ? `<a class="btn btn--secondary" href="${linkHref}">${linkText}</a>` : ''}
  </div>`;
}

/** Рядки інгредієнтів; кількість — у <data value>, щоб її зручно було перераховувати. */
export function ingredientItemsHtml(ingredients) {
  return ingredients.map(({ name, amount, unit }) => {
    const value = amount === null
      ? 'за смаком'
      : `<data value="${amount}">${formatNumber(amount)}</data> ${formatUnit(unit, amount)}`;
    return `<li><span class="ingredient__name">${escapeHtml(name)}</span> — <span class="ingredient__amount">${value}</span></li>`;
  }).join('');
}
