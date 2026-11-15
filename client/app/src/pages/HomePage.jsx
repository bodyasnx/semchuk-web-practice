import { Link, useNavigate } from 'react-router-dom';
import { CATEGORY_NAMES } from '../utils/labels.js';
import { asset } from '../utils/asset.js';

const HERO = 'images/recipes/borshch';

export default function HomePage() {
  const navigate = useNavigate();

  // Пошук з головної веде в каталог: /recipes?q=… — каталог читає запит з адреси
  function handleSearch(event) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q').trim();
    navigate(query ? `/recipes?q=${encodeURIComponent(query)}` : '/recipes');
  }

  return (
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">Рецепти української кухні</h1>
        <p className="lead">
          Традиційні страви з покроковими інструкціями. Оберіть рецепт, вкажіть кількість
          порцій — і сайт сам перерахує, скільки продуктів купити.
        </p>
        <form className="search" role="search" onSubmit={handleSearch}>
          <label htmlFor="home-search">Пошук рецепта за назвою або інгредієнтом</label>
          <div className="search__row">
            <input id="home-search" name="q" type="search" placeholder="Наприклад, вареники або буряк" maxLength={100} />
            <button className="btn btn--primary" type="submit">Знайти</button>
          </div>
        </form>
        <p className="actions"><Link className="btn btn--secondary" to="/recipes">Перейти до каталогу</Link></p>
        <picture>
          <source
            type="image/webp"
            srcSet={`${asset(HERO)}-480.webp 480w, ${asset(HERO)}-800.webp 800w, ${asset(HERO)}-1200.webp 1200w`}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <img
            src={`${asset(HERO)}-800.jpg`}
            alt="Миска червоного борщу зі сметаною і зеленню, поруч скибки житнього хліба і мисочка сала"
            width="800"
            height="600"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </section>

      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="section-title">Категорії</h2>
        <ul className="category-list">
          {Object.entries(CATEGORY_NAMES).map(([value, name]) => (
            <li key={value}><Link className="chip" to={`/recipes?category=${value}`}>{name}</Link></li>
          ))}
        </ul>
      </section>

      <section className="card-grid" aria-labelledby="popular-title">
        <h2 id="popular-title">Популярні рецепти</h2>
        <p className="card-grid__full"><Link className="more-link" to="/recipes">Усі рецепти</Link></p>
      </section>

      <section className="calculator" aria-labelledby="calculator-title">
        <h2 id="calculator-title">Як працює калькулятор порцій</h2>
        <ol>
          <li>Оберіть рецепт у каталозі.</li>
          <li>Вкажіть потрібну кількість порцій — від 1 до 20.</li>
          <li>
            Інгредієнти перерахуються автоматично з розумним округленням: грами — до цілого,
            яйця й зубчики — до половинки, «за смаком» лишається без змін.
          </li>
        </ol>
        <figure className="table-figure">
          <table>
            <thead>
              <tr>
                <th scope="col">Інгредієнт</th>
                <th scope="col">4 порції</th>
                <th scope="col">10 порцій</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Буряк</th><td>300 г</td><td>750 г</td></tr>
              <tr><th scope="row">Морква</th><td>1 шт</td><td>2,5 шт</td></tr>
              <tr><th scope="row">Часник</th><td>3 зубчики</td><td>7,5 зубчика</td></tr>
              <tr><th scope="row">Сіль</th><td>за смаком</td><td>за смаком</td></tr>
            </tbody>
          </table>
          <figcaption>Приклад перерахунку інгредієнтів українського борщу з 4 на 10 порцій.</figcaption>
        </figure>
      </section>

      <aside className="tip" aria-labelledby="tip-title">
        <h2 id="tip-title">Порада тижня</h2>
        <p>
          Щоб борщ зберіг яскравий червоний колір, додайте до буряку під час тушкування
          ложку оцту або лимонного соку.
        </p>
        <p><Link to="/recipes/borshch">До рецепта борщу</Link></p>
      </aside>
    </main>
  );
}
