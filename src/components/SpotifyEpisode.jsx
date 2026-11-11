import React, { useState } from 'react';
import { Play } from 'lucide-react';

// Επεισόδιο Spotify που φορτώνει ΜΟΝΟ με κλικ. Το κανονικό embed στέλνει την IP του επισκέπτη
// στο Spotify και βάζει cookies μόλις ανοίξει η σελίδα, χωρίς συγκατάθεση (GDPR, Fashion ID C-40/17).
export default function SpotifyEpisode({ id, title, height }) {
  const [on, setOn] = useState(false);
  const box = { borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-print)' };
  if (on) {
    return (
      <div style={box}>
        <iframe
          title={title || 'Επεισόδιο'}
          src={`https://open.spotify.com/embed/episode/${id}?theme=0&autoplay=1`}
          width="100%"
          height={height}
          style={{ display: 'block', border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    );
  }
  return (
    <div style={box}>
      <button
        type="button"
        onClick={() => setOn(true)}
        style={{ width: '100%', height, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', background: 'var(--bg-2)', color: 'var(--text)', border: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
      >
        <span style={{ width: 52, height: 52, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--accent)', color: 'var(--bg)' }}>
          <Play size={22} />
        </span>
        <span style={{ minWidth: 0 }}>
          <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || 'Επεισόδιο'}</strong>
          <small style={{ color: 'var(--text-dim)' }}>Πάτα για να φορτώσει ο player του Spotify</small>
        </span>
      </button>
    </div>
  );
}
