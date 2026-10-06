import React, { useEffect, useRef, useState } from 'react';
import stats from '../data/stats.json';

// Νούμερα (social proof). Στοιχεία στο src/data/stats.json: κάθε φορά ΑΝΤΙΚΑΘΙΣΤΑΤΑΙ με το νέο σύνολο, δεν προστίθεται.
// Όταν η λωρίδα φανεί στην οθόνη, τα νούμερα μετράνε από το 0.
const fmt = (n) => Math.round(n).toLocaleString('el-GR');

function Count({ to, run }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return undefined; }
    let raf; const t0 = performance.now(), dur = 1600;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <>{fmt(v)}</>;
}

export default function StatsStrip({ who = 'blackvybez', accent = '#E89827', only = '', inline = false }) {
  const rows = (stats[who] || []).filter((r) => !only || new RegExp(only, 'i').test(r.label));
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!rows.length) return null;
  return (
    <section ref={ref} style={{ padding: inline ? '8px 0 26px' : '28px 0' }} aria-label="Νούμερα">
      <div style={{ maxWidth: inline ? 560 : 1180, margin: inline ? '0' : '0 auto', padding: inline ? 0 : '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '16px 18px', background: 'rgba(255,255,255,.02)' }}>
            <div style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              <Count to={r.value} run={seen} />{r.plus ? '+' : ''}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{r.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
