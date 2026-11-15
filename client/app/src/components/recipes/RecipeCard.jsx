// Картка рецепта. compact — для головної (без категорії й порцій).
// Заголовок першим у DOM (для скрінрідера), фото візуально піднімається вгору через CSS order.
import { Link } from 'react-router-dom';
import RecipePicture from './RecipePicture.jsx';
import RegionBadge from './RegionBadge.jsx';
import { CATEGORY_NAMES, DIFFICULTY_NAMES, formatDuration, isoDuration } from '../../utils/labels.js';

export default function RecipeCard({ recipe, compact = false, lazy = true, sizes }) {
  return (
    <article className="recipe-card">
      <h3 className="recipe-card__title">
        <Link className="recipe-card__link" to={`/recipes/${encodeURIComponent(recipe.id)}`}>{recipe.title}</Link>
      </h3>
      <RecipePicture recipe={recipe} sizes={sizes} lazy={lazy} />
      <p className="recipe-card__desc">{recipe.description}</p>
      <dl className="recipe-card__meta">
        {!compact && (
          <>
            <dt>Категорія</dt>
            <dd>{CATEGORY_NAMES[recipe.category]}</dd>
          </>
        )}
        {recipe.region && (
          <>
            <dt>Регіон</dt>
            <RegionBadge region={recipe.region} />
          </>
        )}
        <dt>Час</dt>
        <dd><time dateTime={isoDuration(recipe.cookTime)}>{formatDuration(recipe.cookTime)}</time></dd>
        <dt>Складність</dt>
        <dd>{DIFFICULTY_NAMES[recipe.difficulty]}</dd>
        {!compact && (
          <>
            <dt>Порції</dt>
            <dd>{recipe.servings}</dd>
          </>
        )}
      </dl>
    </article>
  );
}
