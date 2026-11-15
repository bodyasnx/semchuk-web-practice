import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__strip" aria-hidden="true" />
      <div className="container site-footer__inner">
        <section aria-labelledby="footer-about-title">
          <h2 id="footer-about-title">Смак Традиції</h2>
          <p className="text-muted">Рецепти української кухні з калькулятором порцій.</p>
        </section>
        <nav aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title">Розділи</h2>
          <ul className="site-footer__list">
            <li><Link to="/recipes">Рецепти</Link></li>
            <li><Link to="/recipes/new">Додати рецепт</Link></li>
            <li><Link to="/contacts">Контакти</Link></li>
          </ul>
        </nav>
        <section aria-labelledby="footer-contacts-title">
          <h2 id="footer-contacts-title">Зв&apos;язок</h2>
          <address>
            <a href="mailto:hello@smak-tradytsii.example">hello@smak-tradytsii.example</a><br />
            <a href="tel:+380000000000">+380 00 000 00 00</a>
          </address>
        </section>
      </div>
      <div className="container">
        <p className="site-footer__copy">
          <small>© <time dateTime="2026">2026</time> Смак Традиції. Навчальний проєкт.</small>
        </p>
      </div>
    </footer>
  );
}
