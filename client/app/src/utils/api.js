// Адреси даних. Зараз — статичний JSON з public/, у ПР 8 тут з'явиться REST API (VITE_API_URL).
import { asset } from './asset.js';

export const RECIPES_URL = asset('data/recipes.json');
