// SEO-теги поточного маршруту: title, meta description, canonical, robots, Open Graph і Twitter.
// У SPA сторінка не перезавантажується, тож без цього хука всі адреси мали б теги з index.html.
// (До ПР 9 хук називався useDocumentTitle і ставив лише title і description.)
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Адреса сайту для canonical і og:url. На Netlify (ПР 10) — VITE_SITE_URL з netlify.toml;
// локально — адреса, з якої відкрито сторінку.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');
const DEFAULT_IMAGE = 'images/recipes/borshch-800.jpg';

/** Створює, оновлює або (content = null) видаляє <meta> з атрибутом name чи property. */
function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (content == null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.append(link);
  }
  link.href = href;
}

/**
 * @param {object} meta
 * @param {string} meta.title        заголовок вкладки й og:title
 * @param {string} meta.description  meta description і og:description
 * @param {string} [meta.image]      шлях до фото з public/ для соцмереж (за замовчуванням — борщ)
 * @param {string} [meta.type]       og:type: 'website' або 'article' (сторінка рецепта)
 * @param {boolean} [meta.noindex]   true — не індексувати (404, редагування): robots noindex, без canonical
 */
export function usePageMeta({ title, description, image = DEFAULT_IMAGE, type = 'website', noindex = false }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // canonical — без параметрів пошуку: /recipes?category=drinks і /recipes — одна сторінка каталогу,
    // тож пошуковик не вважатиме кожну комбінацію фільтрів окремою сторінкою-дублікатом
    const url = `${SITE_URL}${pathname}`;
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex' : null);
    setCanonical(noindex ? null : url);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', `${SITE_URL}/${image}`);
  }, [title, description, image, type, noindex, pathname]);
}
