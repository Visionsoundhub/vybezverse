import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import podcastsData from '../data/podcasts.json';

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
  const podcasts = podcastsData.podcasts;
  
  // Sort podcasts by date descending (newest first)
  const sortedPodcasts = [...podcasts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sortedPodcasts[0];

  // Group podcasts by season
  const seasons = podcasts.reduce((acc, podcast) => {
    if (!acc[podcast.season]) {
      acc[podcast.season] = [];
    }
    acc[podcast.season].push(podcast);
    return acc;
  }, {});

  // Sort seasons descending
  const seasonNumbers = Object.keys(seasons).map(Number).sort((a, b) => b - a);

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
          Η φωνή πίσω από τη μουσική. Νευροδιαφορετικότητα, δημιουργία, πατρότητα, ανοιχτές κουβέντες. Δεν είμαστε μόνοι.
        </p>
      </motion.div>

      {/* HERO: latest episode */}
      {latest && (
        <div style={{ marginBottom: 64 }}>
          <span style={{ display: 'inline-block', transform: 'rotate(-1.4deg)', background: 'var(--accent)', color: 'var(--ink-900)', fontFamily: 'var(--font-mono)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 3, marginBottom: 16 }}>
            Φρέσκο απ' το studio · Τελευταίο
          </span>
          <div style={{ position: 'relative' }}>
            <Link to={`/podcasts/${latest.slug}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, cursor: 'pointer' }} aria-label={`Άκου το ${latest.title}`} />
            <EpisodeFrame id={latest.id} title={latest.title} height={232} />
          </div>
          <div style={{ marginTop: 16 }}>
             <Link to={`/podcasts/${latest.slug}`} style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
               Διάβασε περισσότερα &rarr;
             </Link>
          </div>
        </div>
      )}

      {/* THE REST: Grouped by Season */}
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem,4.5vw,2.8rem)', letterSpacing: '-.02em', margin: 0 }}>
          Επεισόδια ανά <span style={{ color: 'var(--accent)' }}>σεζόν</span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
        {seasonNumbers.map(seasonNum => {
          // Sort episodes within season ascending (Episode 1, 2, 3...)
          const seasonEpisodes = [...seasons[seasonNum]].sort((a, b) => a.episode - b.episode);
          
          return (
            <div key={seasonNum}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text)', borderBottom: '1px solid var(--border-strong)', paddingBottom: '12px', marginBottom: '24px' }}>
                SEASON {seasonNum}
              </h3>
              <div style={{ display: 'grid', gap: 24 }}>
                {seasonEpisodes.map((ep) => (
                  <div key={ep.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 16, alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 700, textAlign: 'right' }}>
                      {String(ep.episode).padStart(2, '0')}
                    </div>
                    <div style={{ position: 'relative' }}>
                       {/* Invisible overlay link to intercept clicks and route to SEO page */}
                       <Link to={`/podcasts/${ep.slug}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, cursor: 'pointer' }} aria-label={`Άκου το ${ep.title}`} />
                       <EpisodeFrame id={ep.id} title={ep.title} height={152} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Podcasts;
