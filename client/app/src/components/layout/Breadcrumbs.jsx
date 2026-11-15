import { Link } from 'react-router-dom';

/** Хлібні крихти: items — [{ to, label }], останній пункт (поточна сторінка) без посилання. */
export default function Breadcrumbs({ items, current }) {
  return (
    <nav className="breadcrumbs" aria-label="Хлібні крихти">
      <ol>
        {items.map(({ to, label }) => (
          <li key={to}><Link to={to}>{label}</Link></li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
