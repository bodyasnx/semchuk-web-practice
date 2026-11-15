import { asset } from '../../utils/asset.js';

/**
 * Адаптивне фото: WebP 480/800/1200 + JPG-запас; шляхи виводяться з поля image («…-800.webp»).
 * Рецепт, доданий через форму, поки без фото (image: null) — показуємо петриківку-заглушку.
 */
export default function RecipePicture({ recipe, sizes, lazy = true, priority = false }) {
  if (!recipe.image) {
    return (
      <picture className="recipe-picture--empty">
        <img src={asset('assets/petrykivka.svg')} alt="" width="800" height="600" />
      </picture>
    );
  }
  const base = asset(recipe.image.replace(/-800\.webp$/, ''));
  return (
    <picture>
      <source type="image/webp" srcSet={`${base}-480.webp 480w, ${base}-800.webp 800w, ${base}-1200.webp 1200w`} sizes={sizes} />
      <img
        src={`${base}-800.jpg`}
        alt={recipe.imageAlt}
        width="800"
        height="600"
        loading={lazy ? 'lazy' : undefined}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  );
}
