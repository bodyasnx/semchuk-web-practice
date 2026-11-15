// Шапка: логотип, бургер-меню на <details> і перемикач теми (компонент ThemeToggle).
// NavLink сам ставить aria-current="page" на посилання поточного маршруту — CSS з ПР 5 підсвічує його.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const summaryRef = useRef(null);
  const { pathname } = useLocation();

  // Після переходу на іншу сторінку меню на телефоні має закритися
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Esc закриває меню і повертає фокус на кнопку; клік поза меню — теж закриває
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        summaryRef.current?.focus();
      }
    }
    function onClick(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="logo" to="/">
          <Logo />
        </Link>
        <details
          className="site-menu"
          ref={menuRef}
          open={menuOpen}
          onToggle={(event) => setMenuOpen(event.currentTarget.open)}
        >
          <summary ref={summaryRef} aria-expanded={menuOpen}>
            <span aria-hidden="true">☰</span> Меню
          </summary>
          <nav className="site-nav" aria-label="Головне меню">
            <ul className="site-nav__list">
              <li><NavLink className="site-nav__link" to="/" end>Головна</NavLink></li>
              <li><NavLink className="site-nav__link" to="/recipes" end>Рецепти</NavLink></li>
              <li><NavLink className="site-nav__link" to="/contacts">Контакти</NavLink></li>
              <li className="site-nav__item--add">
                <NavLink className="btn btn--primary" to="/recipes/new">+ Додати рецепт</NavLink>
              </li>
            </ul>
          </nav>
        </details>
        <div className="site-header__actions">
          <NavLink className="btn btn--primary site-header__add" to="/recipes/new">+ Додати рецепт</NavLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
