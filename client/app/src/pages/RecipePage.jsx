// Сторінка рецепта /recipes/:id: GET /api/recipes/:id. Відповідь 404 — стан «рецепт не знайдено».
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import RecipeDetails from '../components/recipes/RecipeDetails.jsx';
import RelatedRecipes from '../components/recipes/RelatedRecipes.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Notice from '../components/ui/Notice.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { recipeUrl } from '../utils/api.js';
import { formatDuration } from '../utils/labels.js';

const CRUMBS = [{ to: '/', label: 'Головна' }, { to: '/recipes', label: 'Рецепти' }];

export default function RecipePage() {
  const { id } = useParams();
  const { data: recipe, loading, error, refetch } = useFetch(recipeUrl(id));
  const notFound = error?.status === 404;

  let pageTitle = 'Рецепт — Смак Традиції';
  let description = 'Покроковий рецепт української страви з калькулятором інгредієнтів на 1–20 порцій.';
  if (recipe) {
    pageTitle = `${recipe.title} — покроковий рецепт | Смак Традиції`;
    description = `${recipe.description} Інгредієнти на 1–20 порцій і ${recipe.steps.length} кроків. Час — ${formatDuration(recipe.cookTime)}.`;
  } else if (notFound) {
    pageTitle = 'Рецепт не знайдено — Смак Традиції';
    description = 'Такого рецепта немає в каталозі «Смак Традиції».';
  }
  usePageMeta({
    title: pageTitle,
    description,
    // фото рецепта для прев'ю в соцмережах; у рецептів, доданих через форму, фото немає
    image: recipe?.image ? recipe.image.replace(/\.webp$/, '.jpg') : undefined,
    type: recipe ? 'article' : 'website',
    noindex: notFound,
  });

  let content;
  let current = 'Рецепт';
  // recipe?.id !== id: під час переходу на інший рецепт ще видно попередній — показуємо лоадер
  if (loading && recipe?.id !== id) {
    content = (
      <article className="recipe" aria-busy="true">
        <h1 className="visually-hidden">Рецепт</h1>
        <Loader text="Завантаження рецепта…" />
      </article>
    );
  } else if (notFound) {
    current = 'Рецепт не знайдено';
    content = (
      <article className="recipe">
        <EmptyState
          headingLevel={1}
          title="Рецепт не знайдено"
          text={`Рецепта з адресою «${id}» немає в каталозі — можливо, його видалили або посилання неповне.`}
          action={{ to: '/recipes', label: 'До каталогу рецептів' }}
        />
      </article>
    );
  } else if (error) {
    content = (
      <article className="recipe">
        <h1>Не вдалося відкрити рецепт</h1>
        <ErrorState title="Рецепт не завантажився." message={error.message} onRetry={refetch} />
      </article>
    );
  } else {
    current = recipe.title;
    content = (
      <>
        {/* key: при переході з одного рецепта на інший (через «Схожі») компонент створюється заново —
            стан порцій і модального вікна не «переїжджає» до іншого рецепта */}
        <RecipeDetails key={recipe.id} recipe={recipe} />
        <RelatedRecipes recipe={recipe} />
      </>
    );
  }

  return (
    <main id="main">
      <Breadcrumbs items={CRUMBS} current={current} />
      <Notice />
      {content}
    </main>
  );
}
