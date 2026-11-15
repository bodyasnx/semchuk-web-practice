import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import AddRecipeForm from '../components/forms/AddRecipeForm.jsx';
import { Required } from '../components/forms/Field.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function AddRecipePage() {
  usePageMeta({
    title: 'Додати рецепт — Смак Традиції',
    description: 'Поділіться власним рецептом української страви: вкажіть інгредієнти на базову кількість порцій і кроки приготування — сайт сам перерахує їх для інших порцій.',
  });
  return (
    <main id="main">
      <Breadcrumbs items={[{ to: '/', label: 'Головна' }, { to: '/recipes', label: 'Рецепти' }]} current="Додати рецепт" />
      <h1>Додати рецепт</h1>
      <p>Поля, позначені зірочкою (<Required />), обов&apos;язкові.</p>
      <AddRecipeForm />
    </main>
  );
}
