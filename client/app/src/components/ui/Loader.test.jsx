// Тест лоадера (ПР 10): пояснення про «засинання» сервера на Render з'являється лише за довгого очікування.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Loader from './Loader.jsx';

describe('Loader', () => {
  afterEach(() => vi.useRealTimers());

  it('через 6 с додає пояснення, що сервер прокидається', () => {
    vi.useFakeTimers();
    render(<Loader />);
    expect(screen.getByRole('status')).toHaveTextContent('Завантаження рецептів…');
    expect(screen.queryByText(/прокидається/)).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(6000));

    expect(screen.getByRole('status')).toHaveTextContent(/Сервер на безкоштовному хостингу прокидається/);
  });
});
