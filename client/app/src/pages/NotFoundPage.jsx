import { Link } from 'react-router-dom';
import { asset } from '../utils/asset.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

// Маршрут * — будь-яка адреса, для якої немає сторінки
export default function NotFoundPage() {
  useDocumentTitle(
    'Сторінку не знайдено (404) — Смак Традиції',
    'Такої сторінки на сайті «Смак Традиції» немає. Поверніться на головну або перегляньте каталог рецептів української кухні.',
  );
  return (
    <main id="main" className="page-404">
      <img src={asset('assets/petrykivka.svg')} alt="" width="240" height="200" />
      <h1>Сторінку не знайдено</h1>
      <p>
        Помилка 404: за цією адресою нічого немає. Можливо, рецепт видалили або адресу введено
        з помилкою.
      </p>
      <p className="actions">
        <Link className="btn btn--primary" to="/">На головну</Link>
        <Link className="btn btn--secondary" to="/recipes">До каталогу рецептів</Link>
      </p>
    </main>
  );
}
