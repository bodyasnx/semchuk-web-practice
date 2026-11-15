// Генерує public/robots.txt і public/sitemap.xml (ПР 9). Запуск: npm run seo
// Адреса сайту — змінна SITE_URL; поки сайт не розміщено (ПР 10), стоїть зарезервований домен .example.
// Після деплою: SITE_URL=https://<адреса> npm run seo — і закомітити оновлені файли.
// Рецепти беруться з server/data/recipes.json: так у карті сайту рівно ті рецепти, що є в API.
import { readFile, writeFile } from 'node:fs/promises';

const SITE_URL = (process.env.SITE_URL || 'https://smak-tradytsii.example').replace(/\/+$/, '');
const recipes = JSON.parse(await readFile(new URL('../../../server/data/recipes.json', import.meta.url), 'utf8'));
const today = new Date().toISOString().slice(0, 10);

// Сторінки для індексації. Не включено: /recipes/new і /recipes/:id/edit (службові форми), 404.
const pages = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
  { path: '/recipes', changefreq: 'weekly', priority: '0.9', lastmod: today },
  ...recipes.map((recipe) => ({
    path: `/recipes/${encodeURIComponent(recipe.id)}`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: recipe.createdAt,
  })),
  { path: '/contacts', changefreq: 'yearly', priority: '0.3', lastmod: today },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const robots = `# Усім пошуковим роботам дозволено індексувати весь сайт.
# Службові сторінки (форма редагування, 404) мають <meta name="robots" content="noindex">:
# закривати їх тут через Disallow не можна — тоді робот не побачить noindex.
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap);
await writeFile(new URL('../public/robots.txt', import.meta.url), robots);
console.log(`sitemap.xml: ${pages.length} адрес, robots.txt — для ${SITE_URL}`);
