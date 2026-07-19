import React from 'react';
import { Link } from 'react-router-dom';
import footer from '../data/footer.json';
import './Footer.css';

// lucide-react in this project ships no brand/social icons, so use mono text glyphs (same as Links.jsx)
const Glyph = ({ label }) => <span className="ft-glyph">{label}</span>;

const navLinks = [
  { to: '/beats', label: 'Beats' },
  { to: '/releases', label: 'Releases' },
  { to: '/podcasts', label: 'Podcasts' },
  { to: '/blog', label: 'Blog' },
  { to: '/bio', label: 'Bio' },
  { to: '/press', label: 'Press' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/account', label: 'Account' },
];

function Socials({ ig, tt, yt, fb }) {
  return (
    <div className="ft-socials">
      {ig && <a href={ig} target="_blank" rel="noreferrer" aria-label="Instagram"><Glyph label="IG" /></a>}
      {tt && <a href={tt} target="_blank" rel="noreferrer" aria-label="TikTok"><Glyph label="TT" /></a>}
      {yt && <a href={yt} target="_blank" rel="noreferrer" aria-label="YouTube"><Glyph label="YT" /></a>}
      {fb && <a href={fb} target="_blank" rel="noreferrer" aria-label="Facebook"><Glyph label="FB" /></a>}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="ft">
      <div className="container ft-inner">
        <div className="ft-top">
          <div className="ft-brand">
            <Link to="/" className="ft-logo">BLACK VYBEZ</Link>
            <p className="ft-tagline">Μουσική για κάθε διαφορετικό μυαλό. Δεν είσαι μόνος.</p>
          </div>

          <nav className="ft-nav" aria-label="Footer">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </nav>
        </div>

        <div className="ft-mid">
          <div className="ft-col">
            <span className="ft-col-title">{footer.artistTitle || 'Black Vybez'}</span>
            <Socials ig={footer.artistIg} tt={footer.artistTt} yt={footer.artistYt} fb={footer.artistFb} />
          </div>
          <div className="ft-col">
            <span className="ft-col-title">{footer.prodTitle || 'Vybezmadethis'}</span>
            <Socials ig={footer.prodIg} tt={footer.prodTt} yt={footer.prodYt} fb={footer.prodFb} />
          </div>
        </div>

        <div className="ft-bottom">
          <span>{footer.copyright || '© Vybezone. All rights reserved.'}</span>
          <span className="ft-mono">Vybezverse</span>
        </div>
      </div>
    </footer>
  );
}
