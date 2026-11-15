import { Link } from 'react-router-dom';
import { asset } from '../../utils/asset.js';

/**
 * Стан «нічого не знайдено» з петриківкою.
 * headingLevel — рівень заголовка: 1, коли це весь вміст сторінки (рецепт не знайдено).
 * action — { to, label } для посилання або { onClick, label } для кнопки.
 */
export default function EmptyState({ title, text, action, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className="empty-state">
      <img src={asset('assets/petrykivka.svg')} alt="" width="240" height="200" />
      <Heading className="empty-state__title">{title}</Heading>
      <p>{text}</p>
      {action?.to && <Link className="btn btn--secondary" to={action.to}>{action.label}</Link>}
      {action?.onClick && (
        <button className="btn btn--secondary" type="button" onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  );
}
