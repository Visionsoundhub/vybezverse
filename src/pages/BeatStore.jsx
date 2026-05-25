import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import beatsData from '../data/beats.json';
import vibesData from '../data/vibes.json';
import { Play, Pause, Search, X, ChevronDown, ChevronUp, Crown, Bot, Box } from 'lucide-react';
import './BeatStore.css';

const BeatStore = () => {
  const [beats, setBeats] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [activeVibe, setActiveVibe] = useState('all');
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);
  
  // Accordion state
  const [expandedSection, setExpandedSection] = useState(null);

  // Filter states
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedBPM, setSelectedBPM] = useState('ALL');
  const [selectedKey, setSelectedKey] = useState('ALL');

  const { currentTrack, isPlaying, playTrack } = useContext(AudioContext);

  useEffect(() => {
    setBeats(beatsData.beatslist || []);
    setVibes(vibesData.vibes || []);
  }, []);

  const toggleAccordion = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleVibeSelect = (vibeName) => {
    setActiveVibe(vibeName);
  };

  const applyVibeSearch = () => {
    setIsVibeModalOpen(false);
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
    <div className="beatstore-page beatstore-wide">
      
      {/* Massive Hero Banner (Mockup style) */}
      <motion.div 
        className="beatstore-banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="banner-bg"></div>
        <div className="banner-content">
          <div className="banner-text-right">
            <h1>PREMIUM BEATS.<br/>UNLEASH YOUR SOUND.</h1>
            <p>High-Quality instrumentals for Artists,<br/>Content Creators & Filmmakers.</p>
            <button className="btn btn-shop-now">SHOP NOW</button>
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
            <span className="vibe-icon">✦</span> 
            VIBE SEARCH
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
            <div className="acc-title"><Crown size={18} color="#bc74f5" /> EXCLUSIVE BEATS</div>
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
                Αποκτήστε τον πλήρη και αποκλειστικό έλεγχο του beat σας. Με κάθε αγορά, το συγκεκριμένο beat αφαιρείται οριστικά από το κατάστημα και είναι πλέον αποκλειστικά δικό σας. Με αυτόν τον τρόπο, εξασφαλίζετε ότι κανείς άλλος δεν θα μπορεί να το χρησιμοποιήσει στο μέλλον. Σημείωση: Τα beats της κατηγορίας "AI Access" εξαιρούνται από την πολιτική αποκλειστικότητας (exclusive rights).
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="accordion-item glass">
          <div className="accordion-header" onClick={() => toggleAccordion('ai')}>
            <div className="acc-title"><Bot size={18} color="#bc74f5" /> AI ACCESS</div>
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
                Αυτή η κατηγορία περιλαμβάνει beats τα οποία εμπεριέχουν ποσοστό τεχνητής νοημοσύνης (AI) στη δημιουργία τους. Λόγω αυτής της φύσης, τα "AI Access" beats δεν διατίθενται για αποκλειστική αγορά. Μπορείτε να τα αποκτήσετε μόνο μέσω leasing (μίσθωσης), με πλήρη δικαιώματα χρήσης, αλλά το beat παραμένει διαθέσιμο και για άλλους χρήστες.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="accordion-item glass">
          <div className="accordion-header" onClick={() => toggleAccordion('vault')}>
            <div className="acc-title"><Box size={18} color="#bc74f5" /> VAULT BEATS</div>
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
                Τα "Vault Beats" αποτελούν μία συλλογή beats σε βελτιωμένη, πιο οικονομική τιμή. Πρόκειται για παλαιότερες παραγωγές για τις οποίες δεν υπάρχει πλέον διαθέσιμο το αρχικό project και, ως εκ τούτου, δεν μπορούν να επεξεργαστούν περαιτέρω. Σημαντικό: Τα beats αυτής της κατηγορίας δεν περιλαμβάνουν τα αρχεία stems. Αποκτάτε το αρχείο beat στην καλύτερη δυνατή ποιότητα.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Beats Grid (Mockup Style - Large Cards) */}
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
                    <a href={beat.checkoutUrl} target="_blank" rel="noreferrer" className="btn btn-add-cart">
                      ADD TO CART
                    </a>
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

      {/* Spectacular Vibe Search Fullscreen Modal */}
      <AnimatePresence>
        {isVibeModalOpen && (
          <div className="vibe-modal-overlay">
            <motion.div 
              className="vibe-modal glass"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button className="modal-close" onClick={() => setIsVibeModalOpen(false)}>
                <X size={28} />
              </button>

              <div className="modal-content-inner">
                <h2 className="modal-title-huge">CHOOSE YOUR VIBE</h2>
                <p className="modal-subtitle">Feel the frequency before you hear the sound.</p>

                <div className="vibe-modal-pills">
                  <button 
                    className={`modal-vibe-pill ${activeVibe === 'all' ? 'active' : ''}`}
                    onClick={() => handleVibeSelect('all')}
                  >
                    <span>Όλα τα vibes</span>
                  </button>
                  {vibes.map((v) => (
                    <button 
                      key={v.name}
                      className={`modal-vibe-pill ${activeVibe === v.name ? 'active' : ''}`}
                      onClick={() => handleVibeSelect(v.name)}
                      style={{'--vibe-color': v.color}}
                    >
                      <div className="pill-bg"></div>
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>

                <div className="modal-actions">
                  <button className="btn btn-switch-frequency" onClick={applyVibeSearch}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                    SWITCH FREQUENCY
                  </button>
                </div>
              </div>

              {/* Animated Audio Visualizer Bar */}
              <div className="modal-visualizer">
                {[...Array(40)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="viz-bar"
                    animate={{ height: ["10%", "100%", "20%", "80%", "10%"] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5 + Math.random(), 
                      ease: "linear",
                      delay: Math.random() 
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BeatStore;
