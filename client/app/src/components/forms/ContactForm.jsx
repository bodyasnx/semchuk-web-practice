// Керована форма зворотного зв'язку: кожне поле читає значення зі стану і пише його через setField.
import Field, { Checkbox } from './Field.jsx';
import FormStatus from './FormStatus.jsx';
import { useForm } from '../../hooks/useForm.js';
import { validateContact } from '../../utils/validation.js';

const TOPICS = [
  { value: 'question', label: 'Питання щодо рецепта' },
  { value: 'recipe', label: 'Пропозиція рецепта' },
  { value: 'bug', label: 'Помилка на сайті' },
  { value: 'partnership', label: 'Співпраця' },
  { value: 'other', label: 'Інше' },
];

const createInitialValues = () => ({
  name: '', email: '', phone: '', topic: '', message: '', consent: false, newsletter: false,
});

export default function ContactForm() {
  const form = useForm({
    createInitialValues,
    validate: validateContact,
    onSubmit: (values) => `Дякуємо, ${values.name.trim()}! Повідомлення прийнято. `
      + 'Поки що це демонстрація — надсилання на сервер з\'явиться в ПР 8.',
  });
  const { values, setField, touch, errorFor } = form;

  // Спільні props текстового поля: значення, запис у стан, позначка «торкалися» при виході
  const bind = (name) => ({
    name,
    value: values[name],
    onChange: (event) => setField(name, event.target.value),
    onBlur: () => touch(name),
  });

  return (
    <form className="form" ref={form.formRef} noValidate onSubmit={form.handleSubmit}>
      <fieldset>
        <legend>Ваші дані</legend>
        <Field id="name" label="Ім'я" required error={errorFor('name')}>
          {(a11y) => <input {...a11y} {...bind('name')} type="text" required minLength={2} maxLength={50} autoComplete="name" />}
        </Field>
        <Field id="email" label="Електронна пошта" required error={errorFor('email')}>
          {(a11y) => <input {...a11y} {...bind('email')} type="email" required maxLength={100} autoComplete="email" placeholder="name@example.com" />}
        </Field>
        <Field
          id="phone"
          label="Телефон"
          hint="Необов'язково. Формат: +380XXXXXXXXX (код країни і 9 цифр без пробілів)."
          error={errorFor('phone')}
        >
          {(a11y) => (
            <input
              {...a11y}
              {...bind('phone')}
              type="tel"
              pattern="\+380[0-9]{9}"
              maxLength={13}
              autoComplete="tel"
              placeholder="+380XXXXXXXXX"
              title="Формат +380XXXXXXXXX: код +380 і 9 цифр"
            />
          )}
        </Field>
      </fieldset>

      <fieldset>
        <legend>Повідомлення</legend>
        <Field id="topic" label="Тема" required error={errorFor('topic')}>
          {(a11y) => (
            <select {...a11y} {...bind('topic')} required>
              <option value="">Оберіть тему</option>
              {TOPICS.map((topic) => <option key={topic.value} value={topic.value}>{topic.label}</option>)}
            </select>
          )}
        </Field>
        <Field id="message" label="Текст повідомлення" required hint="Від 10 до 1000 символів." error={errorFor('message')}>
          {(a11y) => <textarea {...a11y} {...bind('message')} rows={6} required minLength={10} maxLength={1000} />}
        </Field>
      </fieldset>

      <Checkbox
        id="consent"
        name="consent"
        label="Погоджуюся на обробку моїх даних для відповіді на звернення"
        required
        checked={values.consent}
        error={errorFor('consent')}
        onChange={(checked) => { setField('consent', checked); touch('consent'); }}
      />
      <Checkbox
        id="newsletter"
        name="newsletter"
        label="Хочу отримувати листи про нові рецепти"
        checked={values.newsletter}
        onChange={(checked) => setField('newsletter', checked)}
      />

      <p className="actions">
        <button className="btn btn--primary" type="submit">Надіслати</button>
      </p>
      <FormStatus status={form.status} statusRef={form.statusRef} />
    </form>
  );
}
