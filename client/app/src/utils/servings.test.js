// Unit-тести перерахунку порцій (Ф6, розділ 8 TZ.md).
import { describe, it, expect } from 'vitest';
import { scaleAmount, scaleIngredients, normalizeServings, MIN_SERVINGS, MAX_SERVINGS } from './servings.js';

describe('scaleAmount', () => {
  it('перераховує 4 → 10 порцій з округленням за одиницею', () => {
    expect(scaleAmount(500, 'г', 4, 10)).toBe(1250); // 1250 > 100 → кратне 5
    expect(scaleAmount(3, 'зубчик', 4, 10)).toBe(7.5); // до 0,5
    expect(scaleAmount(2.5, 'л', 4, 10)).toBe(6.3); // 6,25 → до 0,1
    expect(scaleAmount(1, 'ст. л.', 4, 10)).toBe(2.5);
  });

  it('4 → 1: не дає отримати 0 шт — мінімум 0,5', () => {
    expect(scaleAmount(1, 'шт', 4, 1)).toBe(0.5); // 0,25 → 0,5, а не 0
    expect(scaleAmount(1, 'ч. л.', 4, 1)).toBe(0.5);
    expect(scaleAmount(2, 'г', 4, 1)).toBe(1); // мінімум 1 г
    expect(scaleAmount(0.2, 'кг', 4, 1)).toBe(0.1); // мінімум 0,1 кг
  });

  it('округлює г і мл до 5, якщо більше 100, і до цілого — якщо менше', () => {
    expect(scaleAmount(300, 'г', 4, 7)).toBe(525); // 525 рівно
    expect(scaleAmount(150, 'мл', 4, 3)).toBe(115); // 112,5 → 115
    expect(scaleAmount(100, 'г', 4, 3)).toBe(75); // 75 ≤ 100 → до цілого
    expect(scaleAmount(50, 'мл', 4, 3)).toBe(38); // 37,5 → 38
  });

  it('«за смаком» не перераховується', () => {
    expect(scaleAmount(null, 'за смаком', 4, 10)).toBeNull();
    expect(scaleAmount(null, 'г', 4, 10)).toBeNull();
  });

  it('кидає помилку на недодатну кількість порцій', () => {
    expect(() => scaleAmount(100, 'г', 0, 4)).toThrow(RangeError);
    expect(() => scaleAmount(100, 'г', 4, -1)).toThrow(RangeError);
  });
});

describe('scaleIngredients', () => {
  it('повертає новий масив і не змінює вихідний', () => {
    const source = [{ name: 'Буряк', amount: 300, unit: 'г' }, { name: 'Сіль', amount: null, unit: 'за смаком' }];
    const result = scaleIngredients(source, 4, 8);
    expect(result).toEqual([{ name: 'Буряк', amount: 600, unit: 'г' }, { name: 'Сіль', amount: null, unit: 'за смаком' }]);
    expect(source[0].amount).toBe(300);
  });
});

describe('normalizeServings — межі 1–20', () => {
  it.each([
    ['0', MIN_SERVINGS, 'min'],
    ['-3', MIN_SERVINGS, 'min'],
    ['25', MAX_SERVINGS, 'max'],
    ['2,6', 3, 'fraction'],
    ['', 4, 'empty'],
    ['abc', 4, 'empty'],
    ['1', 1, null],
    ['20', 20, null],
  ])('«%s» → %i (%s)', (input, value, reason) => {
    expect(normalizeServings(input, 4)).toEqual({ value, reason });
  });
});
