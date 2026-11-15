// Сторінка рецепта /recipes/:id. Невідомий id — стан «рецепт не знайдено».
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import RecipeDetails from '../components/recipes/RecipeDetails.jsx';
import RelatedRecipes from '../components/recipes/RelatedRecipes.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { RECIPES_URL } from '../utils/api.js';
import { formatDuration } from '../utils/labels.js';

const CRUMBS = [{ to: '/', label: 'Головна' }, { to: '/recipes', label: 'Рецепти' }];

export default function RecipePage() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useFetch(RECIPES_URL);
  const recipe = data?.find((item) => item.id === id) ?? null;

  let pageTitle = 'Рецепт — Смак Традиції';
  let description = 'Покроковий рецепт української страви з калькулятором інгредієнтів на 1–20 порцій.';
  if (recipe) {
    pageTitle = `${recipe.title} — покроковий рецепт | Смак Традиції`;
    description = `${recipe.description} Інгредієнти на 1–20 порцій і ${recipe.steps.length} кроків. Час — ${formatDuration(recipe.cookTime)}.`;
  } else if (data) {
    pageTitle = 'Рецепт не знайдено — Смак Традиції';
    description = 'Такого рецепта немає в каталозі «Смак Традиції».';
  }
  useDocumentTitle(pageTitle, description);

  let content;
  let current = 'Рецепт';
  if (loading) {
    content = (
      <article className="recipe" aria-busy="true">
        <h1 className="visually-hidden">Рецепт</h1>
        <Loader text="Завантаження рецепта…" />
      </article>
    );
  } else if (error) {
    content = (
      <article className="recipe">
        <h1>Не вдалося відкрити рецепт</h1>
        <ErrorState message={error.message} onRetry={refetch} />
      </article>
    );
  } else if (!recipe) {
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
  } else {
    current = recipe.title;
    content = (
      <>
        {/* key: при переході з одного рецепта на інший (через «Схожі») компонент створюється заново —
            стан порцій і модального вікна не «переїжджає» до іншого рецепта */}
        <RecipeDetails key={recipe.id} recipe={recipe} />
        <RelatedRecipes recipe={recipe} recipes={data} />
      </>
    );
  }

  return (
    <main id="main">
      <Breadcrumbs items={CRUMBS} current={current} />
      {content}
    </main>
  );
}
