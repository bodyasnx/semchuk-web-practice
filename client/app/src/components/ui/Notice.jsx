// Повідомлення після дії на іншій сторінці («Рецепт збережено», «Рецепт видалено»).
// Текст передається через navigate(шлях, { state: { notice } }). Після показу прибираємо його
// з історії, щоб після оновлення сторінки повідомлення не з'явилося знову.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Notice() {
  const location = useLocation();
  const navigate = useNavigate();
  const [text] = useState(location.state?.notice ?? '');

  useEffect(() => {
    if (location.state?.notice) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }
  }, [location, navigate]);

  if (!text) return null;
  return <p className="form-status form-status--success" role="status">{text}</p>;
}
