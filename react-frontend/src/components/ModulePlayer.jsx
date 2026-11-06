// A module is a text lesson: scroll, read, then mark it as read.
export default function ModulePlayer({ module, done, onMark, locked }) {
  const paragraphs = module.theory || [];
  return (
    <article className="theory" data-testid="module-text">
      <h3 style={{ marginBottom: 4 }}>{module.icon} {module.title}</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{module.lessons} lessons</p>
      <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 8 }}>
        {paragraphs.length === 0 && <p>No text has been added for this module yet.</p>}
        {paragraphs.map((t, i) => <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{t}</p>)}
      </div>
      <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} disabled={done || locked} onClick={() => onMark()} data-testid="mark-theory">
        {done ? 'Completed ✓' : 'Mark module as read'}
      </button>
    </article>
  );
}
