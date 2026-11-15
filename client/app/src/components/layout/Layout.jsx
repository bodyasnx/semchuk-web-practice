// Спільний каркас усіх сторінок: посилання «до вмісту», шапка, <main> і футер.
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Loader from '../ui/Loader.jsx';

// Поки завантажується чанк lazy-сторінки (App.jsx), шапка й футер лишаються на місці,
// а замість вмісту — лоадер. aria-busy розтягує main на висоту екрана (app.css) — без зсуву футера.
const pageFallback = (
  <main id="main" aria-busy="true">
    <Loader text="Завантаження сторінки…" />
  </main>
);

export default function Layout() {
  const { pathname } = useLocation();

  // У SPA браузер не прокручує нову «сторінку» вгору сам — робимо це при зміні маршруту
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Перейти до основного вмісту</a>
      <Header />
      <Suspense fallback={pageFallback}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  );
}
