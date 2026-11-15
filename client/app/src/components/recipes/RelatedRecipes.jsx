import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { recipesUrl } from '../../utils/api.js';

/**
 * «Схожі рецепти»: спершу та сама категорія, потім той самий регіон.
 * Список завантажується окремо від рецепта; поки його немає або сталася помилка — блок не показуємо,
 * бо це додаткова інформація і без неї сторінка рецепта повна.
 */
export default function RelatedRecipes({ recipe }) {
  const { data: recipes } = useFetch(recipesUrl());
  if (!recipes) return null;

  const score = (item) => (item.category === recipe.category ? 2 : 0) + (item.region && item.region === recipe.region ? 1 : 0);
  const related = recipes
    .filter((item) => item.id !== recipe.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
  if (!related.length) return null;

  return (
    <aside className="related" aria-labelledby="related-title">
      <h2 id="related-title">Схожі рецепти</h2>
      <ul>
        {related.map((item) => (
          <li key={item.id}><Link className="chip" to={`/recipes/${encodeURIComponent(item.id)}`}>{item.title}</Link></li>
        ))}
      </ul>
    </aside>
  );
}
