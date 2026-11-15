// Тест компонента: керований ServingsControl у зв'язці зі станом батька.
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServingsControl from './ServingsControl.jsx';

// Обгортка тримає стан, як RecipeDetails у застосунку
function Harness({ initial = 4 }) {
  const [servings, setServings] = useState(initial);
  return <ServingsControl base={4} value={servings} onChange={setServings} />;
}

describe('ServingsControl', () => {
  it('клік «+» збільшує кількість порцій і оновлює статус', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Кількість порцій');
    expect(input).toHaveValue(4);

    await user.click(screen.getByRole('button', { name: 'Збільшити кількість порцій' }));

    expect(input).toHaveValue(5);
    expect(screen.getByText(/Інгредієнти розраховано на 5/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Як у рецепті: 4/ })).toBeVisible();
  });

  it('введене 25 після виходу з поля виправляється на 20 з поясненням', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Кількість порцій');

    await user.clear(input);
    await user.type(input, '25');
    await user.tab();

    expect(input).toHaveValue(20);
    expect(screen.getByText('Максимум — 20 порцій, значення виправлено.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Збільшити кількість порцій' })).toBeDisabled();
  });
});
