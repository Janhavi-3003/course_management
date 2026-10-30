import { useEffect, useState } from 'react';

// One module = photo + video (simulated playback) + theory. All three must be done.
export default function ModulePlayer({ module, done, onMark, locked }) {
  const [tab, setTab] = useState('photo');
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(done.video ? 100 : 0);

  useEffect(() => {
    if (!playing) return undefined;
    const t = setInterval(() => setPct((p) => Math.min(100, p + 5)), 120);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (playing && pct >= 100) { setPlaying(false); onMark('video'); }
  }, [pct, playing]); // eslint-disable-line

  const tabs = [['photo', '🖼️ Photo'], ['video', '🎬 Video'], ['theory', '📖 Theory']];
  return (
    <div>
      <div className="tabs">
        {tabs.map(([k, label]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)} data-testid={`tab-${k}`}>
            {label}{done[k] ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {tab === 'photo' && (
        <div>
          <div className="photo-box">{module.icon}</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} disabled={done.photo || locked} onClick={() => onMark('photo')} data-testid="mark-photo">
            {done.photo ? 'Viewed ✓' : 'Mark photo as viewed'}
          </button>
        </div>
      )}

      {tab === 'video' && (
        <div>
          <div className="video-box" onClick={() => !done.video && !locked && setPlaying((p) => !p)} data-testid="video-box">
            {done.video ? <span>✅ Watched</span> : <div className="play-btn">{playing ? '⏸' : '▶'}</div>}
            <div className="vbar"><i style={{ width: `${pct}%` }} /></div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>
            {module.title} · {module.videoMinutes} min (simulated — click the video to play)
          </p>
        </div>
      )}

      {tab === 'theory' && (
        <div className="theory">
          <h3 style={{ marginBottom: 12 }}>{module.title}</h3>
          {(module.theory || []).map((t, i) => <p key={i}>{t}</p>)}
          <button className="btn btn-primary btn-sm" disabled={done.theory || locked} onClick={() => onMark('theory')} data-testid="mark-theory">
            {done.theory ? 'Read ✓' : 'Mark theory as read'}
          </button>
        </div>
      )}
    </div>
  );
}
