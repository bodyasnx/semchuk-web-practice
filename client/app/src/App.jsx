// Маршрути застосунку. Усі сторінки рендеряться всередині спільного Layout (шапка + футер);
// <Outlet /> у Layout — місце, куди React Router підставляє сторінку поточного маршруту.
//
// Lazy loading (ПР 9): сторінки з формами, контакти і 404 завантажуються окремими файлами (чанками)
// лише тоді, коли людина на них переходить, — основний JS-файл менший і швидше розбирається.
// Головна, каталог і рецепт лишаються в основному файлі: з них зазвичай починається візит,
// і окремий запит за чанком лише затримав би появу вмісту (LCP).
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import RecipePage from './pages/RecipePage.jsx';

const AddRecipePage = lazy(() => import('./pages/AddRecipePage.jsx'));
const EditRecipePage = lazy(() => import('./pages/EditRecipePage.jsx'));
const ContactsPage = lazy(() => import('./pages/ContactsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="recipes" element={<CatalogPage />} />
        {/* /recipes/new оголошено окремо: статичний сегмент має пріоритет над :id */}
        <Route path="recipes/new" element={<AddRecipePage />} />
        <Route path="recipes/:id" element={<RecipePage />} />
        <Route path="recipes/:id/edit" element={<EditRecipePage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
