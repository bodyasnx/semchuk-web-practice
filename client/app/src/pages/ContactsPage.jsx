import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import ContactForm from '../components/forms/ContactForm.jsx';
import { Required } from '../components/forms/Field.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function ContactsPage() {
  useDocumentTitle(
    'Контакти та зворотний зв\'язок — Смак Традиції',
    'Напишіть авторам сайту «Смак Традиції»: питання щодо рецептів, пропозиції нових страв або повідомлення про помилку на сайті.',
  );
  return (
    <main id="main" className="contacts">
      <Breadcrumbs items={[{ to: '/', label: 'Головна' }]} current="Контакти" />
      <h1>Контакти</h1>

      <section aria-labelledby="reach-title">
        <h2 id="reach-title">Як з нами зв&apos;язатися</h2>
        <address>
          Електронна пошта: <a href="mailto:hello@smak-tradytsii.example">hello@smak-tradytsii.example</a><br />
          Телефон: <a href="tel:+380000000000">+380 00 000 00 00</a><br />
          Київ, Україна
        </address>
        <p>Відповідаємо протягом <time dateTime="P2D">2 робочих днів</time>.</p>
      </section>

      <section aria-labelledby="form-title">
        <h2 id="form-title">Форма зворотного зв&apos;язку</h2>
        <p>Поля, позначені зірочкою (<Required />), обов&apos;язкові.</p>
        <ContactForm />
      </section>

      <section className="map" aria-labelledby="map-title">
        <h2 id="map-title">Де нас знайти</h2>
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=30.5134%2C50.4451%2C30.5334%2C50.4551&layer=mapnik&marker=50.4501%2C30.5234"
          title="Мапа OpenStreetMap: центр Києва, Майдан Незалежності"
          width="600"
          height="400"
          loading="lazy"
        />
        <p>
          <a href="https://www.openstreetmap.org/?mlat=50.4501&mlon=30.5234#map=17/50.4501/30.5234">Відкрити велику мапу</a>.
          Дані мапи © <a href="https://www.openstreetmap.org/copyright">учасники OpenStreetMap</a>, ліцензія ODbL.
        </p>
      </section>
    </main>
  );
}
