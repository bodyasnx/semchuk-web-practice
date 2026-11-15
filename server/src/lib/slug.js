// id нового рецепта з назви: «Мамин борщ» → «mamyn-borshch» (спрощена транслітерація за зразком КМУ 2010),
// щоб адреса /recipes/mamyn-borshch була зрозумілою. Якщо такий id уже є — додаємо -2, -3…
const MAP = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i',
  ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia',
};

export function slugify(text) {
  return text
    .toLocaleLowerCase('uk')
    .replace(/[’ʼ'`]/g, '')
    .replace(/[а-яґєії]/g, (char) => MAP[char] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'recipe';
}

export function uniqueId(title, existingIds) {
  const base = slugify(title);
  let id = base;
  for (let n = 2; existingIds.has(id); n += 1) id = `${base}-${n}`;
  return id;
}
