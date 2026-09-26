import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import beatsDataRaw from '../data/beats.json';
import releasesData from '../data/releases.json';
import { AudioContext } from '../context/AudioContext';
import './HomeV2.css';

// Δοκιμή νέας αρχικής: ένα θέμα ανά οθόνη, το νέο single πρώτο.
function Reveal({ children, delay = 0, className }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const MONTHS = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
const fmt = (d) => { const x = new Date(d); return isNaN(x) ? '' : `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`; };

function HomeV2() {
  const { playTrack, currentTrack, isPlaying, openLicenseModal } = React.useContext(AudioContext);
  const all = releasesData.releases || [];
  const single = all[0];
  const more = all.slice(1, 7);
  const beats = (beatsDataRaw.beatslist || []).slice(0, 4);
  const isOn = (t) => currentTrack?.audioSrc === t?.audioSrc && isPlaying;
  const playSingle = () => single?.audioSrc && playTrack({ ...single, artist: 'Black Vybez' });

  return (
    <div className="h2">
      {/* 1. ΝΕΟ SINGLE */}
      <section className="h2-hero">
        <div className="h2-hero-bg" style={{ backgroundImage: `url(${single?.cover})` }} />
        <div className="h2-in h2-hero-grid">
          <Reveal className="h2-hero-txt">
            <div className="h2-kicker"><i /> Νέο single · {fmt(single?.date)}</div>
            <h1 className="h2-title">{single?.title}</h1>
            <p className="h2-lead">{single?.description}</p>
            <div className="h2-cta">
              {single?.audioSrc && (
                <button className="h2-btn pri" onClick={playSingle}>
                  {isOn(single) ? <Pause size={18} /> : <Play size={18} />} {isOn(single) ? 'Παύση' : 'Άκου τώρα'}
                </button>
              )}
              {single?.spotify && <a className="h2-btn" href={single.spotify} target="_blank" rel="noreferrer">Spotify</a>}
              {single?.youtube && <a className="h2-btn" href={single.youtube} target="_blank" rel="noreferrer">YouTube</a>}
              {single?.buy && <a className="h2-btn" href={single.buy} target="_blank" rel="noreferrer">Αγόρασε</a>}
            </div>
            <div className="h2-who">Black Vybez · rapper και producer · Λάρισα</div>
          </Reveal>
          <Reveal delay={0.1} className="h2-sleeve-wrap">
            <button className={'h2-sleeve' + (isOn(single) ? ' spin' : '')} onClick={playSingle} aria-label="Άκου">
              <span className="h2-disc" />
              <img src={single?.cover} alt={single?.title} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* 2. ΠΑΛΙΡΡΟΙΑ */}
      <section className="h2-sec">
        <div className="h2-in h2-album">
          <Reveal>
            <img className="h2-album-art" src="/assets/uploads/palirroia-artwork.webp" alt="ΠΑΛΙΡΡΟΙΑ" loading="lazy" />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h2-eyebrow">Το album</div>
            <h2 className="h2-h2">ΠΑΛΙΡΡΟΙΑ</h2>
            <p className="h2-lead">Το νερό δεν ρωτάει. Απλά παρασέρνει τα πάντα. Τα singles βγαίνουν ένα ένα, το album έρχεται.</p>
            <Link className="h2-btn" to="/releases">Όλες οι κυκλοφορίες <ArrowUpRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      {/* 3. ΚΥΚΛΟΦΟΡΙΕΣ */}
      <section className="h2-sec tight">
        <div className="h2-in">
          <div className="h2-row-head">
            <h2 className="h2-h3">Κυκλοφορίες</h2>
            <Link to="/releases" className="h2-more">Όλες <ArrowUpRight size={14} /></Link>
          </div>
          <div className="h2-rels">
            {more.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.04}>
                <Link to={`/releases/${r.slug}`} className="h2-rel">
                  <img src={r.cover} alt={r.title} loading="lazy" />
                  <b>{r.title}</b>
                  <span>{r.type || 'Single'} · {new Date(r.date).getFullYear() || ''}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEATS */}
      <section className="h2-sec tight">
        <div className="h2-in">
          <div className="h2-row-head">
            <h2 className="h2-h3">Beats</h2>
            <Link to="/beats" className="h2-more">Beatstore <ArrowUpRight size={14} /></Link>
          </div>
          <div className="h2-beats">
            {beats.map((b) => (
              <div key={b.title} className={'h2-beat' + (isOn(b) ? ' on' : '')} onClick={() => playTrack(b)}>
                <img src={b.cover} alt="" loading="lazy" />
                <button className="h2-play" aria-label="Play">{isOn(b) ? <Pause size={16} /> : <Play size={16} />}</button>
                <div className="h2-beat-t">
                  <b>{b.title}</b>
                  <span>{b.bpm} BPM · {b.key} · {(b.tags || []).join(' · ')}</span>
                </div>
                <button className="h2-btn sm" onClick={(e) => { e.stopPropagation(); openLicenseModal(b); }}>Lease</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CHARITY */}
      <section className="h2-sec">
        <div className="h2-in h2-charity">
          <Reveal>
            <div className="h2-eyebrow">Κάθε stream μετράει</div>
            <h2 className="h2-h2 sm">Όλα τα έσοδα από το Spotify πάνε σε φιλανθρωπικό σκοπό.</h2>
            <p className="h2-lead">Ακούγοντας, βοηθάς. Τόσο απλό.</p>
            <a className="h2-btn pri" href="https://open.spotify.com/artist/6I1CYhPF8JMoaCh2zIeGe3" target="_blank" rel="noreferrer"><Play size={18} /> Άκου στο Spotify</a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default HomeV2;
