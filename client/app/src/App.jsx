// Маршрути застосунку. Усі сторінки рендеряться всередині спільного Layout (шапка + футер);
// <Outlet /> у Layout — місце, куди React Router підставляє сторінку поточного маршруту.
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import RecipePage from './pages/RecipePage.jsx';
import AddRecipePage from './pages/AddRecipePage.jsx';
import ContactsPage from './pages/ContactsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="recipes" element={<CatalogPage />} />
        {/* /recipes/new оголошено окремо: статичний сегмент має пріоритет над :id */}
        <Route path="recipes/new" element={<AddRecipePage />} />
        <Route path="recipes/:id" element={<RecipePage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
