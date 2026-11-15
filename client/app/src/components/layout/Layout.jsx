// Спільний каркас усіх сторінок: посилання «до вмісту», шапка, <main> і футер.
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

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
      <Outlet />
      <Footer />
    </>
  );
}
