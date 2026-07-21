import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Music, ExternalLink, ShoppingBag } from 'lucide-react';
import releasesData from '../data/releases.json';

const SPOTIFY = 'https://open.spotify.com/artist/6I1CYhPF8JMoaCh2zIeGe3';
const APPLE = 'https://music.apple.com/gr/artist/black-vybez/1510069891';
const YOUTUBE = 'https://www.youtube.com/@BlackVybezwiththeflow';
const BUY = 'https://blackvybez.lemonsqueezy.com';
const BUNDLE_TIP = 'Στο single παίρνεις: High-Quality audio (MP3/WAV), εναλλακτικές εκδόσεις, ringtone, signed digital artwork, χειρόγραφοι στίχοι με υπογραφή.';

function ReleasePost() {
  const { slug } = useParams();
  const allReleases = [...(releasesData.releases || []), ...(releasesData.upcoming || [])];
  const item = allReleases.find((r) => r.slug === slug);

  if (!item) {
    return (
      <div className="container" style={{ paddingTop: '160px', paddingBottom: '160px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem' }}>Η κυκλοφορία δεν βρέθηκε</h1>
        <Link to="/releases" className="hm-more" style={{ display: 'inline-block', marginTop: 18 }}>← Πίσω στον κατάλογο</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '130px', paddingBottom: '110px' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <Link to="/releases" className="hm-more" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          <ArrowLeft size={14} /> Catalog
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40, '@media (min-width: 768px)': { gridTemplateColumns: '300px 1fr' } }}>
          {/* Cover & Links */}
          <div>
            <img src={item.cover} alt={item.title} style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-print)' }} />
            
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {item.comingSoon ? (
                 <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-dim)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
                   Coming soon
                 </div>
              ) : (
                <>
                  {!item.noSpotify && (
                    <a href={item.spotify || SPOTIFY} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><Play size={16} style={{ marginRight: 8 }} /> Άκου στο Spotify</button>
                    </a>
                  )}
                  <a href={item.apple || APPLE} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}><Music size={16} style={{ marginRight: 8 }} /> Apple Music</button>
                  </a>
                  <a href={item.youtube || YOUTUBE} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}><ExternalLink size={16} style={{ marginRight: 8 }} /> YouTube</button>
                  </a>
                  <a href={item.buy || BUY} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary tip" data-tip={BUNDLE_TIP} style={{ width: '100%', justifyContent: 'center', background: 'var(--accent)', color: 'var(--bg)', marginTop: 12 }}>
                      <ShoppingBag size={16} style={{ marginRight: 8 }} /> Αγορά (Digital Bundle)
                    </button>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: '.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>
              <span>{item.type}</span>
              <span style={{ color: 'var(--accent)' }}>· {item.tag}</span>
              {item.date && <span>· {new Date(item.date).getFullYear()}</span>}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,4.5rem)', lineHeight: 0.95, letterSpacing: '-.02em', margin: '0 0 24px' }}>{item.title}</h1>
            
            <p style={{ color: 'var(--text)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: 30 }}>{item.description}</p>
            
            {item.lyrics && (
              <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 30 }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: '.9rem', color: 'var(--text-dim)', marginBottom: 20 }}>Στίχοι / Σημειώσεις</h3>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text)', lineHeight: 1.8, fontSize: '1.05rem', fontStyle: 'italic' }}>
                  {item.lyrics}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReleasePost;
