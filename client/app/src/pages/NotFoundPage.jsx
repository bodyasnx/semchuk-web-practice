import { Link } from 'react-router-dom';
import { asset } from '../utils/asset.js';

// Маршрут * — будь-яка адреса, для якої немає сторінки
export default function NotFoundPage() {
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
