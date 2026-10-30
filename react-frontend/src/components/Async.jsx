// Shared loading / error / empty states (Task 7)
export function Loading({ text = 'Loading…' }) {
  return <div className="loading">⏳ {text}</div>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <div className="e-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ icon = '📭', title, children }) {
  return (
    <div className="empty-state">
      <div className="e-icon">{icon}</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

// Renders children(data) once data has loaded, otherwise the right state.
export function Async({ state, children, loadingText }) {
  if (state.loading && !state.data) return <Loading text={loadingText} />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;
  return children(state.data);
}
