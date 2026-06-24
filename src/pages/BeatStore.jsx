import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AudioContext } from '../context/AudioContext';
import beatsData from '../data/beats.json';
import vibesData from '../data/vibes.json';
import settingsData from '../data/settings.json';
import { Play, Pause, Search, X, ChevronDown, ChevronUp, Crown, Bot, Box, Heart, ThumbsDown } from 'lucide-react';
import './BeatStore.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const BeatStore = () => {
  const [beats, setBeats] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [activeVibe, setActiveVibe] = useState('all');
  
  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState('beats_offers_releases');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setErrorMessage('');
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preference, source: 'beatstore' }),
      });

      const data = await response.json();
      if (response.ok && (data.success || data.emailCaptured)) {
        setSubscribed(true);
        setEmail('');
      } else {
        setErrorMessage(data.error || 'Υπήρξε ένα σφάλμα. Δοκιμάστε ξανά.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setErrorMessage('Σφάλμα σύνδεσης.');
    }
  };
  
  // Tinder Swipe States
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);
  const [shuffledBeats, setShuffledBeats] = useState([]);
  const [swipeIndex, setSwipeIndex] = useState(0);

  // Accordion state
  const [expandedSection, setExpandedSection] = useState(null);

  // Filter states
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedBPM, setSelectedBPM] = useState('ALL');
  const [selectedKey, setSelectedKey] = useState('ALL');

  const { currentTrack, isPlaying, playTrack, pauseTrack, openLicenseModal } = useContext(AudioContext);

  const containerRef = useRef(null);

  useGSAP(() => {
    if (beats.length === 0) return;

    // Banner entrance animation
    gsap.from('.beatstore-banner', {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    });

    // Staggered beat cards slide up on scroll
    gsap.from('.mockup-card', {
      y: 60,
      opacity: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.mockup-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });

    // Category accordions staggered load
    gsap.from('.accordion-item', {
      x: -40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.categories-accordion',
        start: 'top 90%',
        toggleActions: 'play none none none',
      }
    });
  }, { dependencies: [beats], scope: containerRef });

  useEffect(() => {
    setBeats(beatsData.beatslist || []);
    setVibes(vibesData.vibes || []);
  }, []);

  // When Vibe Search (Tinder mode) opens, shuffle beats
  useEffect(() => {
    if (isVibeModalOpen && beats.length > 0) {
      const shuffled = [...beats].sort(() => 0.5 - Math.random());
      setShuffledBeats(shuffled);
      setSwipeIndex(0);
      playTrack(shuffled[0]);
    }
  }, [isVibeModalOpen, beats]);

  const toggleAccordion = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const nextSwipeCard = (action) => {
    const currentBeat = shuffledBeats[swipeIndex];
    
    if (action === 'like' && currentBeat?.checkoutUrl) {
      window.open(currentBeat.checkoutUrl, '_blank');
    }

    const nextIdx = swipeIndex + 1;
    if (nextIdx < shuffledBeats.length) {
      setSwipeIndex(nextIdx);
      playTrack(shuffledBeats[nextIdx]);
    } else {
      setIsVibeModalOpen(false);
      pauseTrack();
    }
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 100;
    if (offset.x < -swipeThreshold) {
      nextSwipeCard('skip');
    } else if (offset.x > swipeThreshold) {
      nextSwipeCard('like');
    }
  };

  // Derive unique Genres, BPMs, Keys for dropdowns
  const uniqueGenres = ['ALL', ...new Set(beats.map(b => b.category).filter(Boolean))];
  const uniqueBPMs = ['ALL', ...new Set(beats.map(b => b.bpm).filter(Boolean))].sort((a,b) => a === 'ALL' ? -1 : a - b);
  const uniqueKeys = ['ALL', ...new Set(beats.map(b => b.key).filter(Boolean))];

  // Filtering Logic
  const filteredBeats = beats.filter(beat => {
    if (activeVibe !== 'all') {
      const vibe = vibes.find(v => v.name === activeVibe);
      const matchesVibe = vibe && vibe.tags.some(tag => beat.tags.includes(tag));
      if (!matchesVibe) return false;
    }
    if (selectedGenre !== 'ALL' && beat.category !== selectedGenre) return false;
    if (selectedBPM !== 'ALL' && String(beat.bpm) !== String(selectedBPM)) return false;
    if (selectedKey !== 'ALL' && beat.key !== selectedKey) return false;

    return true;
  });

  return (
    <div className="beatstore-page beatstore-wide" ref={containerRef}>
      
      {/* Massive Hero Banner */}
      <motion.div 
        className="beatstore-banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="banner-bg"></div>
        <div className="banner-content">
          <div className="banner-text-right">
            <h1>PRODUCER HUB.<br/>FIND YOUR SOUND.</h1>
            <p>Αποκλειστικά Instrumentals, Beats & AI Tools.</p>
          </div>
        </div>
      </motion.div>

      {/* Toolbar row: Vibe Search + Filters */}
      <div className="beatstore-toolbar">
        <button 
          className="btn btn-vibe-search-main"
          onClick={() => setIsVibeModalOpen(true)}
        >
          <div className="btn-vibe-content">
            <Heart className="vibe-icon-tinder" size={20} /> 
            VIBE SEARCH (SWIPE)
          </div>
        </button>

        <div className="dropdown-filters">
          <div className="filter-select">
            <label>GENRE</label>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              {uniqueGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="filter-select">
            <label>BPM</label>
            <select value={selectedBPM} onChange={(e) => setSelectedBPM(e.target.value)}>
              {uniqueBPMs.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="filter-select">
            <label>KEY</label>
            <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
              {uniqueKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
      </div>

      {activeVibe !== 'all' && (
        <div className="active-vibe-indicator glass">
          <span>Active Vibe: <strong style={{color: '#ff1493'}}>{activeVibe}</strong></span>
          <button className="btn-clear-vibe" onClick={() => setActiveVibe('all')}><X size={16}/></button>
        </div>
      )}

      {/* Accordion Categories */}
      <div className="categories-accordion">
        <div className="accordion-item glass">
          <div className="accordion-header" onClick={() => toggleAccordion('exclusive')}>
            <div className="acc-title"><Crown size={18} color="#bc74f5" /> {settingsData.exclusiveTitle || 'EXCLUSIVE BEATS'}</div>
            {expandedSection === 'exclusive' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          <AnimatePresence>
            {expandedSection === 'exclusive' && (
              <motion.div 
                className="accordion-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <p>{settingsData.exclusiveText}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="accordion-item glass">
          <div className="accordion-header" onClick={() => toggleAccordion('ai')}>
            <div className="acc-title"><Bot size={18} color="#bc74f5" /> {settingsData.aiTitle || 'AI ACCESS'}</div>
            {expandedSection === 'ai' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          <AnimatePresence>
            {expandedSection === 'ai' && (
              <motion.div 
                className="accordion-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <p>{settingsData.aiText}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="accordion-item glass">
          <div className="accordion-header" onClick={() => toggleAccordion('vault')}>
            <div className="acc-title"><Box size={18} color="#bc74f5" /> {settingsData.vaultTitle || 'VAULT BEATS'}</div>
            {expandedSection === 'vault' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          <AnimatePresence>
            {expandedSection === 'vault' && (
              <motion.div 
                className="accordion-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <p>{settingsData.vaultText}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Beats Grid */}
      <motion.div className="mockup-grid" layout>
        <AnimatePresence>
          {filteredBeats.map((beat, idx) => {
            const isThisPlaying = currentTrack?.audioSrc === beat.audioSrc && isPlaying;
            
            return (
              <motion.div 
                key={beat.title + idx}
                className="mockup-card glass"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card-top">
                  <div className="mockup-cover-wrap" onClick={() => playTrack(beat)}>
                    <img src={beat.cover} alt={beat.title} />
                    <div className={`mockup-play-btn ${isThisPlaying ? 'playing' : ''}`}>
                      {isThisPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </div>
                  </div>
                </div>
                
                <div className="card-bottom">
                  <h3>{beat.title}</h3>
                  <div className="mockup-tags">
                    {beat.tags.map(t => <span key={t}>{t.toUpperCase()}</span>)}
                  </div>
                  
                  <div className="card-footer-info">
                    <div className="info-col">
                      <span className="lbl">Key</span>
                      <span className="val">{beat.key || 'N/A'}</span>
                    </div>
                    <div className="info-col">
                      <span className="lbl">BPM</span>
                      <span className="val">{beat.bpm}</span>
                    </div>
                    <div className="info-col">
                      <span className="lbl">Price</span>
                      <span className="val price-val">{beat.price}</span>
                    </div>
                    <button 
                      onClick={() => openLicenseModal(beat)} 
                      className="btn btn-add-cart"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredBeats.length === 0 && (
          <div className="no-results glass" style={{ gridColumn: '1 / -1' }}>
            <Search size={48} opacity={0.5} />
            <p>Δεν βρέθηκαν beats με αυτά τα κριτήρια.</p>
          </div>
        )}
      </motion.div>

      {/* TINDER FOR BEATS MODAL */}
      <AnimatePresence>
        {isVibeModalOpen && shuffledBeats.length > 0 && (
          <div className="tinder-modal-overlay">
            <button className="modal-close" onClick={() => { setIsVibeModalOpen(false); pauseTrack(); }}>
              <X size={32} />
            </button>
            
            <div className="tinder-container">
              <h2 className="tinder-title">DISCOVER BEATS</h2>
              <p className="tinder-subtitle">Swipe Left to Skip. Swipe Right to Buy.</p>

              <div className="tinder-card-area">
                <AnimatePresence>
                  <motion.div
                    key={swipeIndex}
                    className="tinder-card"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ x: 300, opacity: 0, rotate: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  >
                    <img src={shuffledBeats[swipeIndex]?.cover} alt="Beat cover" draggable="false" />
                    <div className="tinder-card-info">
                      <h3>{shuffledBeats[swipeIndex]?.title}</h3>
                      <p>{shuffledBeats[swipeIndex]?.category} | {shuffledBeats[swipeIndex]?.bpm} BPM</p>
                    </div>

                    {/* Like / Skip badges that show on drag (optional, requires complex drag state, kept simple here) */}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="tinder-controls">
                <button className="btn-tinder skip" onClick={() => nextSwipeCard('skip')}>
                  <ThumbsDown size={32} />
                </button>
                <button className="btn-tinder like" onClick={() => nextSwipeCard('like')}>
                  <Heart size={32} />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* BEATSTORE NEWSLETTER */}
      <section className="beatstore-newsletter glass" style={{ padding: '40px', marginTop: '60px', borderRadius: '16px', textAlign: 'center' }}>
        <h2>Μείνε Συντονισμένος</h2>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>Γράψου στο VIP Newsletter του Beatstore.</p>
        {subscribed ? (
          <div style={{ color: '#bc74f5', fontWeight: 'bold' }}>✓ Επιτυχής Εγγραφή!</div>
        ) : (
          <form onSubmit={handleSubscribe} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Το email σου..." value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
            <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="bs_pref" value="beats_offers_releases" checked={preference === 'beats_offers_releases'} onChange={e => setPreference(e.target.value)} /> 
                Με ενδιαφέρουν Beats, Προσφορές & Κυκλοφορίες του Black Vybez
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="bs_pref" value="only_beats_offers" checked={preference === 'only_beats_offers'} onChange={e => setPreference(e.target.value)} /> 
                Μόνο Beats και Προσφορές
              </label>
            </div>
            <button type="submit" className="btn-solid" style={{ width: '100%' }}>ΕΓΓΡΑΦΗ</button>
            {errorMessage && <div style={{ color: '#ff4d4d' }}>{errorMessage}</div>}
          </form>
        )}
      </section>

    </div>
  );
};

export default BeatStore;
