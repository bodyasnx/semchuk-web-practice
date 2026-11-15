/** Підсумок надсилання форми: помилка або успіх; role="status" — скрінрідер оголосить зміну. */
export default function FormStatus({ status, statusRef }) {
  return (
    <p
      ref={statusRef}
      className={`form-status${status ? ` form-status--${status.type}` : ''}`}
      role="status"
      tabIndex={-1}
      hidden={!status}
    >
      {status?.text}
    </p>
  );
}
