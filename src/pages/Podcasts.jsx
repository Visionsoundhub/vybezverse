import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mic } from 'lucide-react';

// Episodes newest → last. The LAST one is the latest (hero on top).
const EPISODES = [
  { id: '2DmCeCjz7UbGoak0VqOahQ' },
  { id: '0oeMEeSQKad817hZ80Kszg' },
  { id: '0KhP3s0MQDFjfcr3PhfG3V' },
  { id: '306f84j2hWbIlxk3CPAQOi' },
  { id: '3ratiZ7bDvnuZvGo6ZTX12' },
  { id: '2VI6MlaNWjQdlBAEl8Zt3k' },
  { id: '1JpyqIUHRE8cyEUD2RxxeG' },
  { id: '5ljlWDLDfdUlOJfoPJsI0r' },
];

function EpisodeFrame({ id, title, height }) {
  return (
    <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-print)' }}>
      <iframe
        title={title || 'Επεισόδιο'}
        src={`https://open.spotify.com/embed/episode/${id}?theme=0`}
        width="100%"
        height={height}
        style={{ display: 'block', border: 0 }}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}

function Podcasts() {
  const reduce = useReducedMotion();
  const latest = EPISODES[EPISODES.length - 1];
  const rest = EPISODES.slice(0, -1);

  return (
    <div className="container" style={{ paddingTop: '130px', paddingBottom: '100px' }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={reduce ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', fontSize: '.85rem', marginBottom: 16 }}>
          <Mic size={15} style={{ verticalAlign: -2, marginRight: 8 }} />The podcast
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,9vw,6rem)', lineHeight: 0.9, letterSpacing: '-.02em', margin: 0 }}>
          Μπαμπάς των 2 <span style={{ color: 'var(--accent)' }}>&amp; rapper</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.15rem', lineHeight: 1.6, marginTop: 22, maxWidth: '56ch' }}>
          Η φωνή πίσω από τη μουσική. Νευροδιαφορετικότητα, δημιουργία, πατρότητα — ανοιχτές κουβέντες. Δεν είμαστε μόνοι.
        </p>
      </motion.div>

      {/* HERO — latest episode */}
      <div style={{ marginBottom: 64 }}>
        <span style={{ display: 'inline-block', transform: 'rotate(-1.4deg)', background: 'var(--accent)', color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, marginBottom: 16 }}>
          Φρέσκο απ' το studio · Τελευταίο
        </span>
        <EpisodeFrame id={latest.id} title="Τελευταίο επεισόδιο" height={232} />
      </div>

      {/* THE REST — in order */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 26 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,4.5vw,2.8rem)', letterSpacing: '-.02em', margin: 0 }}>
          Θες να τα ακούσεις <span style={{ color: 'var(--accent)' }}>με τη σειρά;</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {rest.map((ep, i) => (
          <div key={ep.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 16, alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 700, textAlign: 'right' }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <EpisodeFrame id={ep.id} title={`Επεισόδιο ${i + 1}`} height={152} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Podcasts;
