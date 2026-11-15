// Поле форми з підписом, підказкою і помилкою. Сам елемент введення передається як функція
// (render prop): Field дає йому id і атрибути доступності, а тип поля обирає батько.

/** Позначка обов'язкового поля, як у статичній версії. */
export function Required() {
  return <abbr title="обов'язкове поле">*</abbr>;
}

/** Помилка під полем; span, бо поле часто лежить у <p>, а <p> у <p> вкладати не можна. */
export function FieldError({ id, message }) {
  if (!message) return null;
  return <span className="field__error" id={id}>{message}</span>;
}

/**
 * Атрибути доступності для поля: aria-invalid і aria-describedby (помилка першою, далі підказки).
 * Порожні значення не виводимо, щоб у DOM не було aria-describedby="".
 */
export function a11yProps(id, error, ...hintIds) {
  const describedBy = [error && `${id}-error`, ...hintIds].filter(Boolean).join(' ');
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  };
}

export default function Field({ id, label, required = false, hint, error, children, className }) {
  return (
    <p className={className}>
      <label htmlFor={id}>{label}{required && <> <Required /></>}</label>
      {children(a11yProps(id, error, hint && `${id}-hint`))}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      <FieldError id={`${id}-error`} message={error} />
    </p>
  );
}

/** Прапорець з підписом праворуч (згода, розсилка). */
export function Checkbox({ id, name, label, required = false, checked, error, onChange, onBlur }) {
  return (
    <p className="check">
      <input
        {...a11yProps(id, error)}
        name={name}
        type="checkbox"
        required={required}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        onBlur={onBlur}
      />
      <label htmlFor={id}>{label}{required && <> <Required /></>}</label>
      <FieldError id={`${id}-error`} message={error} />
    </p>
  );
}
