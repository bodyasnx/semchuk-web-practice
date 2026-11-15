// Каталог: стан фільтрів зберігається в адресі (useSearchParams), тому посилання «Напої» з головної
// (/recipes?category=drinks) відкриває вже відфільтрований каталог, а результатом можна поділитися.
// Ті самі параметри йдуть у GET /api/recipes — шукає, фільтрує і сортує сервер.
import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import Filters from '../components/catalog/Filters.jsx';
import SortSelect from '../components/catalog/SortSelect.jsx';
import RecipeList from '../components/recipes/RecipeList.jsx';
import Loader from '../components/ui/Loader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Notice from '../components/ui/Notice.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { recipesUrl } from '../utils/api.js';
import { readFilters, filtersToParams, activeFiltersCount } from '../utils/catalog.js';
import { plural } from '../utils/labels.js';

const CARD_SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 45vw, 100vw';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsTitleRef = useRef(null);
  useDocumentTitle(
    'Каталог рецептів української кухні — Смак Традиції',
    'Каталог рецептів української кухні: перші й другі страви, вареники, випічка, десерти і напої. Пошук і фільтри за категорією, регіоном і часом приготування.',
  );

  // Фільтри — похідні дані від адреси, окремий useState для них не потрібен
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const { data, loading, error, refetch } = useFetch(recipesUrl(filtersToParams(filters)));
  const found = data ?? [];

  // replace: true — зміна фільтра не створює новий запис в історії (кнопка «Назад» веде зі сторінки)
  const updateFilters = (patch) => setSearchParams(filtersToParams({ ...filters, ...patch }), { replace: true });
  const resetFilters = () => setSearchParams(filtersToParams({ ...readFilters(new URLSearchParams()), sort: filters.sort }), { replace: true });

  const count = found.length;
  const resultsTitle = data ? `Знайдено ${count} ${plural(count, ['рецепт', 'рецепти', 'рецептів'])}` : 'Рецепти';

  return (
    <main id="main" className="catalog">
      <Breadcrumbs items={[{ to: '/', label: 'Головна' }]} current="Рецепти" />
      <h1>Каталог рецептів</h1>
      <Notice />

      <Filters
        filters={filters}
        activeCount={activeFiltersCount(filters)}
        onChange={updateFilters}
        onReset={resetFilters}
        onApply={() => resultsTitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />

      <section className="card-grid results" aria-labelledby="results-title">
        <div className="results__head card-grid__full">
          <h2 id="results-title" ref={resultsTitleRef}>{resultsTitle}</h2>
          <SortSelect value={filters.sort} onChange={(sort) => updateFilters({ sort })} />
        </div>

        <p className="visually-hidden" aria-live="polite">{data ? resultsTitle : ''}</p>
        <div className="card-grid card-grid__full" aria-busy={loading}>
          {/* лоадер лише при першому завантаженні; далі старий список видно, доки не прийде новий */}
          {loading && !data && <Loader />}
          {error && <ErrorState message={error.message} onRetry={refetch} />}
          {data && (
            <RecipeList
              recipes={found}
              sizes={CARD_SIZES}
              eagerCount={3}
              empty={(
                <EmptyState
                  title="Нічого не знайдено"
                  text="Спробуйте змінити запит або скинути фільтри."
                  action={{ onClick: resetFilters, label: 'Скинути фільтри' }}
                />
              )}
            />
          )}
        </div>
      </section>
    </main>
  );
}
