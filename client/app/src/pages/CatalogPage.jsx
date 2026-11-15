import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';

// Каркас каталогу. Список, пошук і фільтри з'являться як окремі компоненти.
export default function CatalogPage() {
  return (
    <main id="main" className="catalog">
      <Breadcrumbs items={[{ to: '/', label: 'Головна' }]} current="Рецепти" />
      <h1>Каталог рецептів</h1>
    </main>
  );
}
