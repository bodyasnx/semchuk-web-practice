// Вміст сторінки рецепта: шапка з фактами, фото, калькулятор порцій, кроки, видалення з підтвердженням.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import RecipePicture from './RecipePicture.jsx';
import RegionBadge from './RegionBadge.jsx';
import ServingsControl from './ServingsControl.jsx';
import IngredientList from './IngredientList.jsx';
import Modal from '../ui/Modal.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { normalizeServings } from '../../utils/servings.js';
import {
  CATEGORY_NAMES, DIFFICULTY_NAMES, formatDuration, isoDuration, formatDate, formatNumber, formatUnit, servingsWord,
} from '../../utils/labels.js';

const PHOTO_SIZES = '(min-width: 1280px) 700px, 100vw';

/** Розмітка schema.org Recipe (JSON-LD) для пошукових систем; «<» екрановано, щоб текст не закрив <script>. */
function jsonLd(recipe) {
  const data = {
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
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function RecipeDetails({ recipe }) {
  // Вибір порцій пам'ятається окремо для кожного рецепта; збережене значення перевіряємо (1–20)
  const [stored, setServings] = useLocalStorage(`smak:servings:${recipe.id}`, recipe.servings);
  const checked = normalizeServings(String(stored), recipe.servings);
  const servings = checked.reason ? recipe.servings : checked.value;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState('');
  const credit = recipe.imageCredit;

  function handleDelete() {
    setConfirmOpen(false);
    setStatus('Видалення запрацює після підключення сервера (ПР 8) — зараз рецепт не видалено.');
  }

  return (
    <article className="recipe">
      <header className="recipe__header">
        <h1>{recipe.title}</h1>
        <p className="lead">{recipe.description}</p>
        <dl className="recipe-facts">
          <dt>Категорія</dt>
          <dd><Link to={`/recipes?category=${recipe.category}`}>{CATEGORY_NAMES[recipe.category]}</Link></dd>
          <dt>Регіон</dt>
          <RegionBadge region={recipe.region} />
          <dt>Час приготування</dt>
          <dd><time dateTime={isoDuration(recipe.cookTime)}>{formatDuration(recipe.cookTime)}</time></dd>
          <dt>Складність</dt>
          <dd>{DIFFICULTY_NAMES[recipe.difficulty]}</dd>
          <dt>Базова кількість порцій</dt>
          <dd>{recipe.servings}</dd>
          <dt>Опубліковано</dt>
          <dd><time dateTime={recipe.createdAt}>{formatDate(recipe.createdAt)}</time></dd>
        </dl>
      </header>

      <figure className="recipe__photo">
        <RecipePicture recipe={recipe} sizes={PHOTO_SIZES} lazy={false} priority />
        <figcaption>
          Фото: {credit.author && `${credit.author}, `}<a href={credit.url}>{credit.source}</a>, {credit.license}.
        </figcaption>
      </figure>

      <section className="recipe__ingredients" aria-labelledby="ingredients-title">
        <h2 id="ingredients-title">Інгредієнти</h2>
        <div>
          <ServingsControl base={recipe.servings} value={servings} onChange={setServings} />
        </div>
        <IngredientList ingredients={recipe.ingredients} base={recipe.servings} servings={servings} />
      </section>

      <section className="recipe__steps" aria-labelledby="steps-title">
        <h2 id="steps-title">Приготування</h2>
        <ol className="steps">
          {/* кроки не мають id і не переставляються, тому індекс тут — допустимий key */}
          {recipe.steps.map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </section>

      <footer className="recipe__footer">
        <p className="actions">
          <Link className="btn btn--secondary" to="/recipes/new">Редагувати рецепт</Link>
          <button className="btn btn--danger" type="button" onClick={() => setConfirmOpen(true)}>Видалити рецепт</button>
        </p>
        {status && <p className="form-status" role="status">{status}</p>}
      </footer>

      <Modal
        open={confirmOpen}
        title="Видалити рецепт?"
        confirmLabel="Видалити"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      >
        «{recipe.title}» буде видалено без можливості відновлення.
      </Modal>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(recipe) }} />
    </article>
  );
}
