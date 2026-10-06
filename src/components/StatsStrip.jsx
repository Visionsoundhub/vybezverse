import React from 'react';
import stats from '../data/stats.json';

// Νούμερα (social proof). Τα στοιχεία στο src/data/stats.json, τα ενημερώνει το Κέντρο.
const fmt = (n) => (n >= 10000 ? `${Math.round(n / 1000)}K` : n.toLocaleString('el-GR'));

export default function StatsStrip({ who = 'blackvybez', accent = '#E89827' }) {
  const rows = stats[who] || [];
  if (!rows.length) return null;
  return (
    <section style={{ padding: '28px 0' }} aria-label="Νούμερα">
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '16px 18px', background: 'rgba(255,255,255,.02)' }}>
            <div style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: accent, lineHeight: 1 }}>{fmt(r.value)}</div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{r.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
