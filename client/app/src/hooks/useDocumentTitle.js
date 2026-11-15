// Заголовок вкладки і meta description для поточного маршруту.
// У SPA сторінка не перезавантажується, тож без цього хука title лишався б від index.html.
import { useEffect } from 'react';

export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!description) return;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [description]);
}
