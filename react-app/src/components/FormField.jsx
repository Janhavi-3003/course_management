export function Field({ id, label, error, errorMsg, hint, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`} id={id}>
      {label && <label htmlFor={id + '-input'}>{label}</label>}
      {children}
      {hint && <p className="hint">{hint}</p>}
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
    </div>
  );
}

export function Banner({ message, type }) {
  if (!message) return <div className="banner"></div>;
  return <div className={`banner show ${type}`}>{message}</div>;
}
