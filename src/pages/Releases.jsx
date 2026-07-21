import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Music, Disc3, ShoppingBag, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import releasesData from '../data/releases.json';

const BUY = 'https://blackvybez.lemonsqueezy.com';
const BUNDLE_TIP = 'Digital Bundle: High-Quality Audio (WAV/MP3), Acapella (μόνο τα φωνητικά), Ringtone, High-Res Artwork & επιπλέον υλικό!';

const SPOTIFY = 'https://open.spotify.com/artist/6I1CYhPF8JMoaCh2zIeGe3';
const APPLE = 'https://music.apple.com/gr/artist/black-vybez/1510069891';
const YOUTUBE = 'https://www.youtube.com/@BlackVybezwiththeflow';

function Releases() {
  const [tab, setTab] = useState('singles');
  const reduce = useReducedMotion();
  const items = tab === 'singles' ? releasesData.releases || [] : releasesData.upcoming || [];

  return (
    <div className="container hm" style={{ paddingTop: '130px', paddingBottom: '110px', background: 'none' }}>

      <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', fontSize: '.85rem', marginBottom: 16 }}>Music catalog</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,9vw,6rem)', lineHeight: .9, letterSpacing: '-.02em', margin: 0 }}>
        Κάθε track, μια <span style={{ color: 'var(--accent)' }}>συχνότητα</span>
      </h1>

      {/* Listen everywhere */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 30 }}>
        <a href={SPOTIFY} target="_blank" rel="noreferrer"><button className="btn-primary"><Play size={16} style={{ marginRight: 8, verticalAlign: -3 }} />Spotify</button></a>
        <a href={APPLE} target="_blank" rel="noreferrer"><button className="btn-outline"><Music size={16} style={{ marginRight: 8, verticalAlign: -3 }} />Apple Music</button></a>
        <a href={YOUTUBE} target="_blank" rel="noreferrer"><button className="btn-outline"><ExternalLink size={16} style={{ marginRight: 8, verticalAlign: -3 }} />YouTube</button></a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginTop: 54, marginBottom: 30 }}>
        {['singles', 'albums'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={tab === t ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {t === 'singles' ? 'Singles' : 'EPs / Albums'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? {} : { opacity: 0, y: -16 }}
          transition={{ duration: 0.28 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)', background: 'var(--ink-800)', border: '1px solid var(--border-strong)', boxShadow: '5px 5px 0 var(--oxblood)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--ink-900)', padding: '3px 9px', borderRadius: 3 }}>{item.type}</span>
                <Disc3 size={56} color="var(--accent)" opacity={0.6} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>{item.title}</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--accent)', marginTop: 4 }}>{item.tag}{item.tracks ? ` · ${item.tracks} tracks` : ''}</p>
              </div>
              {item.comingSoon ? (
                <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-dim)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                  Coming soon
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Stream</div>
                  <div style={{ display: 'grid', gridTemplateColumns: item.noSpotify ? '1fr 1fr' : '1fr 1fr 1fr', gap: 6 }}>
                    {!item.noSpotify && (
                      <a href={item.spotify || SPOTIFY} target="_blank" rel="noreferrer" title="Spotify"><button className="btn-outline" style={{ width: '100%', padding: '9px' }} aria-label="Spotify"><Play size={15} /></button></a>
                    )}
                    <a href={item.apple || APPLE} target="_blank" rel="noreferrer" title="Apple Music"><button className="btn-outline" style={{ width: '100%', padding: '9px' }} aria-label="Apple Music"><Music size={15} /></button></a>
                    <a href={item.youtube || YOUTUBE} target="_blank" rel="noreferrer" title="YouTube"><button className="btn-outline" style={{ width: '100%', padding: '9px' }} aria-label="YouTube"><ExternalLink size={15} /></button></a>
                  </div>
                  <a href={item.buy || BUY} target="_blank" rel="noreferrer"><button className="btn-primary tip" data-tip={BUNDLE_TIP} style={{ width: '100%', padding: '10px' }}><ShoppingBag size={15} style={{ marginRight: 6, verticalAlign: -2 }} />Αγόρασε</button></a>
                  <Link to={`/releases/${item.slug}`} style={{ textDecoration: 'none', marginTop: 4 }}>
                    <button className="btn-outline" style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      Προβολή <ArrowRight size={14} style={{ marginLeft: 6 }} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

export default Releases;
