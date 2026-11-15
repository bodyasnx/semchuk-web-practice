/** Стан «помилка» з кнопкою повтору; onRetry зазвичай — refetch з useFetch. */
export default function ErrorState({ message, onRetry, title = 'Не вдалося завантажити рецепти.' }) {
  return (
    <div className="state state--error" role="alert">
      <p><strong>{title}</strong> {message}</p>
      {onRetry && (
        <button className="btn btn--primary" type="button" onClick={onRetry}>Спробувати ще</button>
      )}
    </div>
  );
}
