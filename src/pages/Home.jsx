import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import beatsDataRaw from '../data/beats.json';
import homeData from '../data/home.json';
import genresData from '../data/genres.json';
import { AudioContext } from '../context/AudioContext';
import HeroAccount from '../components/HeroAccount';
import SectionBg from '../components/SectionBg';
import './Home.css';

const sectionsList = [
  { id: 'hero', label: 'INTRO' },
  { id: 'album', label: 'ΠΑΛΙΡΡΟΙΑ' },
  { id: 'latest', label: 'LATEST DROP' },
  { id: 'charity', label: 'CHARITY' },
  { id: 'beats', label: 'NEW BEATS' },
  { id: 'live', label: 'LIVE' }
];

const stripColors = ['var(--ochre)', 'var(--oxblood)', 'var(--pine)', 'var(--vermilion)'];
const stripInk = { 'var(--oxblood)': 'var(--bone-100)', 'var(--pine)': 'var(--bone-100)' };

function Reveal({ children, delay = 0 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Home() {
  const { playTrack, currentTrack, isPlaying, openLicenseModal } = React.useContext(AudioContext);
  const [active, setActive] = useState('hero');
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    sectionsList.forEach((s) => { const el = refs.current[s.id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const goto = (id) => {
    const el = refs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const set = (id) => (el) => { if (el) refs.current[id] = el; };
  const beats = (beatsDataRaw.beatslist || []).slice(0, 4);
  const genres = (genresData.genres || []).slice(0, 6);

  return (
    <div className="hm">
      <nav className="hm-index" aria-label="Sections">
        {sectionsList.map((s, i) => (
          <button key={s.id} className={active === s.id ? 'on' : ''} onClick={() => goto(s.id)}>
            <span>{String(i + 1).padStart(2, '0')} {s.label}</span>
            <span className="dot" />
          </button>
        ))}
      </nav>

      <div className="hm-wrap">

        {/* HERO */}
        <section id="hero" ref={set('hero')} className="hm-section hm-hero">
          <SectionBg src="/assets/uploads/hero-banner.webp" parallax />
          <div className="hm-hero-top">
            <span>Flowless Music &nbsp;·&nbsp; Producer &nbsp;·&nbsp; <b>Larisa → ∞</b></span>
            <HeroAccount />
          </div>
          <Reveal>
            <h1 className="hm-title">
              <span className="l1">{homeData.heroLine1 || 'BLACK VYBEZ'}</span>
            </h1>
            <div className="hm-title-sub">{homeData.heroLine2 || 'vybezmadethis'}</div>
          </Reveal>
          <div className="hm-hero-grid">
            <Reveal delay={0.08}>
              <div>
                <p className="hm-hero-desc">
                  Καλωσήρθες στο σύμπαν μου. <em>Δημιουργώ κόσμους.</em>
                </p>
                <div className="hm-hero-cta">
                  <Link to="/releases"><button className="btn-primary">Releases</button></Link>
                  <Link to="/beats"><button className="btn-outline">Άκου beats</button></Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="hm-poster">
                <div className="cat">Now pressing</div>
                <div className="big">{homeData.heroTitle || 'VYBEZONE'}</div>
                <div className="sub">{homeData.heroSubtitle || 'No limits in music. Just pure vibes.'}</div>
                <div className="hm-script">για κάθε διαφορετικό μυαλό. Δεν είσαι μόνος.</div>
              </div>
            </Reveal>
          </div>
          <div className="hm-tape">
            {genres.map((g, i) => {
              const bg = stripColors[i % stripColors.length];
              return (
                <span key={g.name} className="hm-strip" style={{ background: bg, color: stripInk[bg] || 'var(--ink-900)' }}>
                  {g.note}
                </span>
              );
            })}
          </div>
        </section>

        {/* ALBUM */}
        <section id="album" ref={set('album')} className="hm-section">
          <SectionBg src="/assets/uploads/section-tide.webp" position="center 55%" overlayRgb="3,33,46" overlayOpacity={[0.72, 0.42]} />
          <div className="hm-eyebrow"><b>02</b> Νέο album / coming soon</div>
          <Reveal>
            <h2 className="hm-statement"><span className="hm-mark-tide">ΠΑΛΙΡΡΟΙΑ</span></h2>
            <p className="hm-lead">Το νερό δεν ρωτάει. Απλά παρασέρνει τα πάντα. Το νέο κεφάλαιο ανοίγει σύντομα.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <img className="hm-album-art" src="/assets/uploads/palirroia-artwork.webp" alt="ΠΑΛΙΡΡΟΙΑ official artwork" loading="lazy" />
          </Reveal>
        </section>

        {/* LATEST DROP */}
        <section id="latest" ref={set('latest')} className="hm-section">
          <SectionBg src="/assets/uploads/section-jazzbar.webp" position="center 40%" />
          <div className="hm-eyebrow"><b>03</b> Latest drop</div>
          <div className="hm-drop">
            <Reveal>
              <div className="hm-sleeve">
                <div className="disc" />
                <span className="name">Jazz Bar</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <span className="hm-badge">Vintage Freq</span>
                <h3 className="hm-statement" style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>{homeData.dropTitle || 'Jazz Bar των τεράτων'}</h3>
                <p className="hm-lead">Το απόλυτο single από τη σειρά Vintage Freq. Συντονίσου.</p>
                <div className="hm-hero-cta">
                  <a href={homeData.dropStream || '#'} target="_blank" rel="noreferrer"><button className="btn-primary"><Play size={17} style={{ marginRight: 8, verticalAlign: -3 }} />Stream now</button></a>
                  <a href={homeData.dropBuy || '#'} target="_blank" rel="noreferrer"><button className="btn-outline">View bundle</button></a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CHARITY */}
        <section id="charity" ref={set('charity')} className="hm-section">
          <SectionBg src="/assets/uploads/section-charity.webp" position="center 60%" />
          <div className="hm-eyebrow"><b>04</b> Charity</div>
          <Reveal>
            <h2 className="hm-statement" style={{ maxWidth: '18ch' }}>Η μουσική <span className="hm-mark-cool">επιστρέφει</span></h2>
            <p className="hm-lead">Όλα τα έσοδα από τα streams στο Spotify πηγαίνουν απευθείας σε φιλανθρωπικό οργανισμό. Ακούγοντας, βοηθάς.</p>
            <div className="hm-hero-cta">
              <button className="btn-primary hm-btn-spotify"><Play size={17} style={{ marginRight: 8, verticalAlign: -3 }} />Άκου στο Spotify</button>
            </div>
          </Reveal>
        </section>

        {/* NEW BEATS */}
        <section id="beats" ref={set('beats')} className="hm-section">
          <SectionBg src="/assets/uploads/section-beats.webp" position="center 30%" />
          <div className="hm-eyebrow"><b>05</b> New beats <Link to="/beats" className="hm-more" style={{ marginLeft: 'auto' }}>Beatstore <ArrowUpRight size={13} style={{ verticalAlign: -2 }} /></Link></div>
          <Reveal>
            <h2 className="hm-statement" style={{ fontSize: 'clamp(2rem,7vw,4.5rem)' }}>New <span className="hm-mark">beats</span></h2>
            <p className="hm-lead" style={{ marginBottom: '34px' }}>Φρέσκα instrumentals, έτοιμα για vocals.</p>
          </Reveal>
          <div className="hm-beats">
            {beats.map((beat) => {
              const playing = currentTrack?.title === beat.title && isPlaying;
              return (
                <div key={beat.title} className="hm-beat" onClick={() => playTrack(beat)}>
                  <button className="hm-play" aria-label="Play">{playing ? <Pause size={17} /> : <Play size={17} />}</button>
                  <div>
                    <div className="hm-beat-title">{beat.title}</div>
                    <div className="hm-beat-meta"><span>{beat.bpm || 120} BPM</span><span>{beat.key || 'Am'}</span></div>
                  </div>
                  <div className="hm-right">
                    <div className="hm-tags">{(beat.tags || []).slice(0, 2).map((t) => <span key={t} className="hm-tag">{t}</span>)}</div>
                    <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '.82rem' }} onClick={(e) => { e.stopPropagation(); openLicenseModal(beat); }}>Buy lease</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* LIVE */}
        <section id="live" ref={set('live')} className="hm-section">
          <SectionBg src="/assets/uploads/section-live.webp" position="center 30%" />
          <div className="hm-eyebrow"><b>06</b> Live shows</div>
          <Reveal>
            <div className="hm-stamp">
              <div className="k">Stay tuned</div>
              <h2 className="hm-statement" style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', maxWidth: 'none', margin: '14px 0 10px' }}>Η σκηνή ετοιμάζεται</h2>
              <p className="hm-lead" style={{ margin: '0 auto' }}>Οι επόμενες ζωντανές εμφανίσεις ανακοινώνονται σύντομα.</p>
            </div>
          </Reveal>
        </section>

      </div>
    </div>
  );
}

export default Home;
