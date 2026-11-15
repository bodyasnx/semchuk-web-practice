import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';

export default function AddRecipePage() {
  return (
    <main id="main">
      <Breadcrumbs items={[{ to: '/', label: 'Головна' }, { to: '/recipes', label: 'Рецепти' }]} current="Додати рецепт" />
      <h1>Додати рецепт</h1>
    </main>
  );
}
