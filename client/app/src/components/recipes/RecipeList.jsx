import RecipeCard from './RecipeCard.jsx';

/**
 * Список карток. key={recipe.id} — стабільний ідентифікатор: коли фільтр прибирає чи
 * переставляє картки, React зіставляє їх за id і не перемальовує зайвого.
 * Перші eagerCount карток — без lazy loading (вони видимі одразу, це LCP).
 */
export default function RecipeList({ recipes, compact = false, sizes, eagerCount = 0, empty = null }) {
  if (!recipes.length) return empty;
  return recipes.map((recipe, index) => (
    <RecipeCard key={recipe.id} recipe={recipe} compact={compact} sizes={sizes} lazy={index >= eagerCount} />
  ));
}
