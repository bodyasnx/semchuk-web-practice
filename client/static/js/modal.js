// Модальне вікно підтвердження на нативному <dialog>.
// showModal() робить решту сторінки неактивною; додатково — фокус-пастка (Tab не виходить
// за межі вікна), Esc закриває (подія cancel), фокус повертається на кнопку, що відкрила вікно.

let dialog = null;

function createDialog() {
  const element = document.createElement('dialog');
  element.className = 'modal';
  element.setAttribute('aria-labelledby', 'modal-title');
  element.setAttribute('aria-describedby', 'modal-text');
  element.innerHTML = `<h2 class="modal__title" id="modal-title"></h2>
    <p id="modal-text"></p>
    <div class="modal__actions">
      <button class="btn btn--secondary" type="button" data-modal="cancel">Скасувати</button>
      <button class="btn btn--primary" type="button" data-modal="confirm">Підтвердити</button>
    </div>`;
  document.body.append(element);
  return element;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const items = [...dialog.querySelectorAll(FOCUSABLE)];
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

/**
 * Показує вікно підтвердження. Повертає Promise<boolean>: true — «Підтвердити», false — скасовано
 * (кнопкою, Esc або кліком по затемненню).
 */
export function confirmDialog({ title, text, confirmLabel = 'Підтвердити', cancelLabel = 'Скасувати', danger = false }) {
  dialog ??= createDialog();
  const confirmButton = dialog.querySelector('[data-modal="confirm"]');
  const cancelButton = dialog.querySelector('[data-modal="cancel"]');
  dialog.querySelector('#modal-title').textContent = title;
  dialog.querySelector('#modal-text').textContent = text;
  confirmButton.textContent = confirmLabel;
  cancelButton.textContent = cancelLabel;
  confirmButton.className = `btn ${danger ? 'btn--danger' : 'btn--primary'}`;

  const opener = document.activeElement;
  dialog.returnValue = '';

  return new Promise((resolve) => {
    function onClick(event) {
      const action = event.target.closest('[data-modal]')?.dataset.modal;
      if (action) dialog.close(action);
      else if (event.target === dialog) dialog.close('cancel'); // клік по затемненню навколо вікна
    }
    function onClose() {
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', trapFocus);
      if (opener instanceof HTMLElement) opener.focus();
      resolve(dialog.returnValue === 'confirm');
    }
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('keydown', trapFocus);
    dialog.addEventListener('close', onClose, { once: true });
    dialog.showModal();
    cancelButton.focus(); // безпечна дія за замовчуванням: випадковий Enter не видалить рецепт
  });
}
