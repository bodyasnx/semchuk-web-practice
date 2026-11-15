import { asset } from '../../utils/asset.js';

/** Стан «завантаження»: зірка-лоадер з ПР 3; role="status" — скрінрідер оголосить текст. */
export default function Loader({ text = 'Завантаження рецептів…' }) {
  return (
    <div className="state" role="status">
      <img className="state__loader" src={asset('assets/star-loader.svg')} alt="" width="48" height="48" />
      <p>{text}</p>
    </div>
  );
}
