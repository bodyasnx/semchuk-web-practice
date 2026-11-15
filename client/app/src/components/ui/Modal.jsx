// Модальне вікно підтвердження на нативному <dialog>.
// Стан «відкрито» живе в батьківському компоненті (проп open), а цей компонент синхронізує його з DOM:
// showModal() робить решту сторінки неактивною, Tab не виходить за межі вікна, Esc і клік по
// затемненню скасовують дію, після закриття фокус повертається на кнопку, що відкрила вікно.
import { useEffect, useId, useRef } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open, title, children, confirmLabel = 'Підтвердити', cancelLabel = 'Скасувати', danger = false, onConfirm, onCancel,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const openerRef = useRef(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement;
      dialog.showModal();
      cancelRef.current.focus(); // безпечна дія за замовчуванням: випадковий Enter нічого не видалить
    } else if (!open && dialog.open) {
      dialog.close();
      openerRef.current?.focus?.();
    }
  }, [open]);

  // Esc викликає подію cancel; скасовуємо закриття браузером, щоб стан лишався в React
  useEffect(() => {
    const dialog = dialogRef.current;
    const handleCancel = (event) => {
      event.preventDefault();
      onCancel();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onCancel]);

  function trapFocus(event) {
    if (event.key !== 'Tab') return;
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      aria-describedby={textId}
      onKeyDown={trapFocus}
      onClick={(event) => { if (event.target === dialogRef.current) onCancel(); }}
    >
      <h2 className="modal__title" id={titleId}>{title}</h2>
      <p id={textId}>{children}</p>
      <div className="modal__actions">
        <button ref={cancelRef} className="btn btn--secondary" type="button" onClick={onCancel}>{cancelLabel}</button>
        <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} type="button" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}
