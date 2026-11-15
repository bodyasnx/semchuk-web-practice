// /recipes/:id/edit — та сама форма, що й «Додати рецепт», заповнена даними рецепта; збереження — PUT.
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import AddRecipeForm from '../components/forms/AddRecipeForm.jsx';
import { Required } from '../components/forms/Field.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { recipeUrl } from '../utils/api.js';

export default function EditRecipePage() {
  const { id } = useParams();
  const { data: recipe, loading, error, refetch } = useFetch(recipeUrl(id));
  useDocumentTitle(recipe ? `Редагування: ${recipe.title} — Смак Традиції` : 'Редагування рецепта — Смак Традиції');

  const crumbs = [{ to: '/', label: 'Головна' }, { to: '/recipes', label: 'Рецепти' }];
  if (recipe) crumbs.push({ to: `/recipes/${encodeURIComponent(recipe.id)}`, label: recipe.title });

  let content;
  if (loading) {
    content = <><h1>Редагувати рецепт</h1><Loader text="Завантаження рецепта…" /></>;
  } else if (error?.status === 404) {
    content = (
      <EmptyState
        headingLevel={1}
        title="Рецепт не знайдено"
        text={`Рецепта з адресою «${id}» немає в каталозі — редагувати нічого.`}
        action={{ to: '/recipes', label: 'До каталогу рецептів' }}
      />
    );
  } else if (error) {
    content = <><h1>Редагувати рецепт</h1><ErrorState title="Рецепт не завантажився." message={error.message} onRetry={refetch} /></>;
  } else {
    content = (
      <>
        <h1>Редагувати рецепт</h1>
        <p>Поля, позначені зірочкою (<Required />), обов&apos;язкові.</p>
        <AddRecipeForm key={recipe.id} recipe={recipe} />
      </>
    );
  }

  return (
    <main id="main">
      <Breadcrumbs items={crumbs} current="Редагування" />
      {content}
    </main>
  );
}
