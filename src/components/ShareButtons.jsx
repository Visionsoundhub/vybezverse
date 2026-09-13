import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';

// Reused on every article page (static /blog/:slug and live ALICE
// /blogs/:slug posts) so readers can push a post out to socials without
// leaving the site. Plain share-intent URLs, no SDK/pixel needed.
function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (older browser, no HTTPS); fail quietly.
    }
  };

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-strong)',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '.78rem',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    textDecoration: 'none',
    background: 'transparent',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
        Μοιράσου
      </span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={btnStyle}>
          {l.label}
        </a>
      ))}
      <button onClick={copyLink} style={btnStyle}>
        {copied ? <><Check size={13} /> Έγινε!</> : <><Link2 size={13} /> Link</>}
      </button>
    </div>
  );
}

export default ShareButtons;
