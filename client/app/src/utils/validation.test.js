// Unit-тести валідації форм (Ф9): «Додати рецепт» і «Контакти».
import { describe, it, expect } from 'vitest';
import { checkText, checkNumber, validateRecipe, validateContact } from './validation.js';

const validRecipe = () => ({
  title: 'Борщ',
  category: 'first',
  description: '',
  servings: '4',
  cookTime: '90',
  difficulty: 'easy',
  image: null,
  ingredients: [
    { key: 'a', name: 'Буряк', amount: '300', unit: 'г' },
    { key: 'b', name: 'Сіль', amount: '', unit: 'за смаком' },
  ],
  steps: [{ key: 's1', text: 'Зваріть бульйон протягом години.' }],
  rights: true,
});

const validContact = () => ({
  name: 'Богдан',
  email: 'test@example.com',
  phone: '',
  topic: 'question',
  message: 'Скільки варити борщ?',
  consent: true,
});

describe('checkText і checkNumber', () => {
  it('розрізняє порожнє поле, «лише пробіли» і довжину', () => {
    expect(checkText('', { required: true })).toBe('Заповніть це поле.');
    expect(checkText('   ', { required: true })).toBe('Поле не може складатися лише з пробілів.');
    expect(checkText('Аб', { min: 3 })).toMatch(/Мінімум 3/);
    expect(checkText('Борщ', { min: 3, max: 100 })).toBeNull();
  });

  it('перевіряє межі, ціле число і один знак після коми', () => {
    expect(checkNumber('21', { min: 1, max: 20, integer: true })).toBe('Введіть число від 1 до 20.');
    expect(checkNumber('2.5', { min: 1, max: 20, integer: true })).toBe('Введіть ціле число.');
    expect(checkNumber('0.3', { min: 0, max: 10 })).toBeNull(); // без хибної помилки через 0.3 * 10
    expect(checkNumber('0.25', { min: 0, max: 10 })).toBe('Не більше одного знака після коми.');
  });
});

describe('validateRecipe', () => {
  it('коректна форма — без помилок', () => {
    expect(validateRecipe(validRecipe())).toEqual({});
  });

  it('прив\'язує помилки рядків до key, а не до номера', () => {
    const values = validRecipe();
    values.ingredients[0].amount = '0';
    values.ingredients[1].amount = '5'; // «за смаком» з кількістю
    values.servings = '25';
    values.rights = false;
    expect(validateRecipe(values)).toEqual({
      'ingredients.a.amount': 'Кількість має бути більшою за 0.',
      'ingredients.b.amount': 'Для «за смаком» залиште кількість порожньою.',
      servings: 'Введіть число від 1 до 20.',
      rights: 'Потрібна ваша згода.',
    });
  });
});

describe('validateContact', () => {
  it('коректна форма — без помилок; телефон необов\'язковий', () => {
    expect(validateContact(validContact())).toEqual({});
    expect(validateContact({ ...validContact(), phone: '+380501234567' })).toEqual({});
  });

  it('відхиляє email і телефон у неправильному форматі', () => {
    const errors = validateContact({ ...validContact(), email: 'test@', phone: '0501234567', message: 'Коротко' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'phone']);
    expect(errors.phone).toMatch(/\+380XXXXXXXXX/);
  });
});
