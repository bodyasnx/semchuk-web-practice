// Тест компонента: картка рецепта показує назву-посилання і фото з alt.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecipeCard from './RecipeCard.jsx';

const recipe = {
  id: 'borshch',
  title: 'Український борщ',
  category: 'first',
  region: 'poltavshchyna',
  description: 'Наваристий червоний борщ.',
  servings: 4,
  cookTime: 120,
  difficulty: 'medium',
  image: 'images/recipes/borshch-800.webp',
  imageAlt: 'Миска червоного борщу зі сметаною',
};

describe('RecipeCard', () => {
  it('рендерить назву як посилання на сторінку рецепта', () => {
    // Link працює лише всередині маршрутизатора, тому обгортаємо в MemoryRouter
    render(<MemoryRouter><RecipeCard recipe={recipe} /></MemoryRouter>);

    const link = screen.getByRole('link', { name: 'Український борщ' });
    expect(link).toHaveAttribute('href', '/recipes/borshch');
    expect(screen.getByRole('heading', { level: 3, name: 'Український борщ' })).toBeInTheDocument();
    expect(screen.getByText('Перші страви')).toBeInTheDocument();
  });

  it('фото має alt, розміри і lazy loading', () => {
    render(<MemoryRouter><RecipeCard recipe={recipe} /></MemoryRouter>);

    const img = screen.getByRole('img', { name: recipe.imageAlt });
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
  });
});
