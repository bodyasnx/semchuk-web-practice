import { Link } from 'react-router-dom';

/** «Схожі рецепти»: спершу та сама категорія, потім той самий регіон. */
export default function RelatedRecipes({ recipe, recipes }) {
  const score = (item) => (item.category === recipe.category ? 2 : 0) + (item.region === recipe.region ? 1 : 0);
  const related = recipes
    .filter((item) => item.id !== recipe.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);

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
