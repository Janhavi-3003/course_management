export function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
      <p className="error-msg">{error}</p>
    </div>
  );
}

export function Banner({ type = 'bad', message }) {
  return <div className={`banner ${type}${message ? ' show' : ''}`} role={type === 'bad' ? 'alert' : 'status'}>{message}</div>;
}
