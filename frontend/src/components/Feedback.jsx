export function ErrorMessage({ children }) {
  if (!children) return null;
  return <div className="feedback error-feedback" role="alert">{children}</div>;
}

export function SuccessMessage({ children }) {
  if (!children) return null;
  return <div className="feedback success-feedback" role="status">{children}</div>;
}

export function Loading({ label = 'Loading your collection…' }) {
  return <div className="loading-state"><span className="loader"/><span>{label}</span></div>;
}

export function EmptyState({ title, detail }) {
  return <div className="empty-state"><span className="empty-symbol">✳</span><h3>{title}</h3><p>{detail}</p></div>;
}
