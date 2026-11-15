import { useEffect, useState } from 'react';
import { asset } from '../../utils/asset.js';

// Через скільки мілісекунд пояснити, чому завантаження довге (ПР 10): безкоштовний сервер
// на Render «засинає» після 15 хв без запитів, і перший запит після цього триває до хвилини.
const SLOW_AFTER_MS = 6000;

/** Стан «завантаження»: зірка-лоадер з ПР 3; role="status" — скрінрідер оголосить текст. */
export default function Loader({ text = 'Завантаження рецептів…' }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="state" role="status">
      <img className="state__loader" src={asset('assets/star-loader.svg')} alt="" width="48" height="48" />
      <p>{text}</p>
      {slow && (
        <p>Сервер на безкоштовному хостингу прокидається після простою — перше завантаження може тривати до хвилини.</p>
      )}
    </div>
  );
}
