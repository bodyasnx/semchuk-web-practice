// Спільне налаштування тестів: матчери toBeInTheDocument, toHaveAttribute тощо
// і очищення DOM після кожного тесту, щоб тести не впливали один на одного.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
