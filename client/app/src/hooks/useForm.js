// Керована форма: значення в стані React, помилки обчислюються зі значень на кожному рендері.
// Помилку поля показуємо після першого виходу з нього (touched) або після спроби надіслати —
// а не одразу при відкритті сторінки, коли людина ще нічого не встигла ввести.
//
// Надсилання асинхронне: onSubmit(values) робить запит до API і повертає текст успіху
// (або undefined, якщо сам перейшов на іншу сторінку). Якщо сервер відповів 400 з переліком
// помилок, mapServerErrors перетворює їх на { шлях поля: повідомлення } — і вони з'являються
// під тими самими полями, що й помилки клієнтської перевірки.
import { useEffect, useRef, useState } from 'react';
import { plural } from '../utils/labels.js';

const fieldsWord = (count) => plural(count, ['поле потребує', 'поля потребують', 'полів потребують']);

const defaultMapServerErrors = (details) => Object.fromEntries(details.map(({ field, message }) => [field, message]));

export function useForm({ createInitialValues, validate, onSubmit, mapServerErrors = defaultMapServerErrors }) {
  const [values, setValues] = useState(createInitialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error' | 'success', text }
  const [resetCount, setResetCount] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const formRef = useRef(null);
  const statusRef = useRef(null);

  const clientErrors = validate(values);
  // Клієнтська помилка важливіша: вона відповідає тому, що в полі зараз
  const errors = { ...serverErrors, ...clientErrors };
  const errorFor = (path) => (submitted || touched[path] ? errors[path] : undefined);

  /** Людина змінила поле — помилка сервера для нього (і його вкладених полів) вже неактуальна. */
  function clearServerError(path) {
    setServerErrors((prev) => {
      const keys = Object.keys(prev).filter((key) => key === path || key.startsWith(`${path}.`));
      if (!keys.length) return prev;
      const next = { ...prev };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    clearServerError(name);
  };
  const touch = (path) => setTouched((prev) => (prev[path] ? prev : { ...prev, [path]: true }));

  // Після невдалого надсилання фокус — на перше поле з помилкою (ефект: DOM уже оновлено)
  useEffect(() => {
    if (focusRequest) formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusRequest]);

  // Повідомлення про успіх отримує фокус, щоб скрінрідер його прочитав
  useEffect(() => {
    if (status?.type === 'success') statusRef.current?.focus();
  }, [status]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return; // подвійне натискання не створить два рецепти
    setSubmitted(true);

    const count = Object.keys(clientErrors).length;
    if (count) {
      setStatus({ type: 'error', text: `Перевірте форму: ${count} ${fieldsWord(count)} виправлення.` });
      setFocusRequest((n) => n + 1);
      return;
    }

    setPending(true);
    setStatus(null);
    try {
      const text = await onSubmit(values);
      if (text === undefined) return; // onSubmit сам перейшов на іншу сторінку
      setValues(createInitialValues());
      setTouched({});
      setSubmitted(false);
      setServerErrors({});
      setResetCount((n) => n + 1);
      setStatus({ type: 'success', text });
    } catch (error) {
      if (error.details?.length) {
        const mapped = mapServerErrors(error.details, values);
        setServerErrors(mapped);
        const fields = Object.keys(mapped).length;
        setStatus({ type: 'error', text: `Сервер не прийняв форму: ${fields} ${fieldsWord(fields)} виправлення.` });
        setFocusRequest((n) => n + 1);
      } else {
        // мережа, 500 тощо — дані у формі лишаються, можна просто спробувати ще раз
        setStatus({ type: 'error', text: `Не вдалося надіслати форму. ${error.message}` });
      }
    } finally {
      setPending(false);
    }
  }

  return {
    values, setValues, setField, touch, errorFor, clearServerError, handleSubmit,
    pending, status, formRef, statusRef, resetCount,
  };
}
