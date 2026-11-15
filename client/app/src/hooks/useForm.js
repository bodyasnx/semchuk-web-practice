// Керована форма: значення в стані React, помилки обчислюються з значень на кожному рендері.
// Помилку поля показуємо після першого виходу з нього (touched) або після спроби надіслати —
// а не одразу при відкритті сторінки, коли людина ще нічого не встигла ввести.
import { useEffect, useRef, useState } from 'react';
import { plural } from '../utils/labels.js';

export function useForm({ createInitialValues, validate, onSubmit }) {
  const [values, setValues] = useState(createInitialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error' | 'success', text }
  const [resetCount, setResetCount] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const formRef = useRef(null);
  const statusRef = useRef(null);

  const errors = validate(values);
  const errorFor = (path) => (submitted || touched[path] ? errors[path] : undefined);

  const setField = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const touch = (path) => setTouched((prev) => (prev[path] ? prev : { ...prev, [path]: true }));

  // Після невдалого надсилання фокус — на перше поле з помилкою (ефект: DOM уже оновлено)
  useEffect(() => {
    if (focusRequest) formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusRequest]);

  // Повідомлення про успіх отримує фокус, щоб скрінрідер його прочитав
  useEffect(() => {
    if (status?.type === 'success') statusRef.current?.focus();
  }, [status]);

  function handleSubmit(event) {
    event.preventDefault();
    const count = Object.keys(errors).length;
    if (count) {
      setSubmitted(true);
      setStatus({
        type: 'error',
        text: `Перевірте форму: ${count} ${plural(count, ['поле потребує', 'поля потребують', 'полів потребують'])} виправлення.`,
      });
      setFocusRequest((n) => n + 1);
      return;
    }
    const text = onSubmit(values);
    setValues(createInitialValues());
    setTouched({});
    setSubmitted(false);
    setResetCount((n) => n + 1);
    setStatus({ type: 'success', text });
  }

  return { values, setValues, setField, touch, errorFor, handleSubmit, status, formRef, statusRef, resetCount };
}
