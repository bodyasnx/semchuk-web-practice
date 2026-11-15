import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';

// /recipes/:id — useParams() повертає значення динамічного сегмента адреси
export default function RecipePage() {
  const { id } = useParams();
  return (
    <main id="main">
      <Breadcrumbs items={[{ to: '/', label: 'Головна' }, { to: '/recipes', label: 'Рецепти' }]} current="Рецепт" />
      <article className="recipe">
        <h1>Рецепт</h1>
        <p>Ідентифікатор рецепта з адреси: <code>{id}</code></p>
      </article>
    </main>
  );
}
