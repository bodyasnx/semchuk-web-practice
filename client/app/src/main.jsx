// Точка входу React-застосунку: стилі в тому ж порядку, що й у статичній версії, і маршрутизатор.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { registerServiceWorker } from './utils/registerServiceWorker.js';

import './styles/fonts.css';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/typography.css';
import './styles/components.css';
import './styles/site.css';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// PWA: офлайн-сторінка і кешування статики (src/sw.js)
registerServiceWorker();
