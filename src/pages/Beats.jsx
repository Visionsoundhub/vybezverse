import React, { useState, useContext } from 'react';
import { Play, Search, ShoppingCart, SlidersHorizontal, Music, Star, Send, LayoutGrid, List, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import beatsDataRaw from '../data/beats.json';
import { AudioContext } from '../context/AudioContext';

function Beats() {
  const { playTrack, currentTrack, isPlaying, openLicenseModal } = useContext(AudioContext);
  const [newsletterType, setNewsletterType] = useState('beats_news');
  const [viewMode, setViewMode] = useState('list'); // Default to list for beatstores
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const genres = ['All', 'Trap', 'Drill', 'Boombap', 'R&B', 'Synthwave', 'Pop'];

  // Real beats from our JSON
  const realBeats = beatsDataRaw.beatslist.map((beat, i) => ({
    id: `real-${i}`,
    title: beat.title,
    tags: beat.tags || [],
    genre: beat.genre || 'Trap',
    key: beat.key || 'Am',
    bpm: beat.bpm || 120,
    price: beat.price || '29.99€',
    color: i % 2 === 0 ? 'var(--accent-magenta)' : 'var(--accent-violet)',
    audioSrc: beat.audioSrc,
    checkoutUrl: beat.checkoutUrl,
    cover: beat.cover,
    isReal: true
  }));

  // Dummy catalog to demonstrate pagination working perfectly
  const dummyBeats = Array.from({ length: 22 }).map((_, i) => {
    const genresList = ['Trap', 'Drill', 'Boombap', 'R&B', 'Synthwave', 'Pop'];
    const genre = genresList[i % genresList.length];
    return { 
      id: `dummy-${i}`,
      title: `Beat Track ${i + 1}`, 
      tags: [genre.toUpperCase(), 'VIBE'], 
      genre: genre, 
      key: ['Am', 'Fm', 'Cm', 'Gm'][i % 4], 
      bpm: 80 + (i * 5) % 60, 
      price: i % 3 === 0 ? '79.99€' : '29.99€', 
      color: i % 2 === 0 ? 'var(--accent-magenta)' : 'var(--accent-violet)',
      isReal: false
    };
  });

  const beatsData = [...realBeats, ...dummyBeats];

  // Filter beats based on selected genre
  const filteredBeats = selectedGenre === 'All' 
    ? beatsData 
    : beatsData.filter(beat => beat.genre === selectedGenre);

  // Pagination Logic
  const itemsPerPage = viewMode === 'list' ? 10 : 6;
  const totalPages = Math.max(1, Math.ceil(filteredBeats.length / itemsPerPage));
  const currentBeats = filteredBeats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1); // Reset to page 1 on view change
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      
      {/* 1. HERO BANNER - PRODUCER HUB */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(112,0,255,0.4) 0%, rgba(20,0,40,0.8) 60%, rgba(5,5,10,1) 100%)',
          borderRadius: '30px',
          padding: '80px 40px',
          textAlign: 'center',
          marginBottom: '40px',
          border: '1px solid rgba(112,0,255,0.2)',
          boxShadow: '0 20px 60px rgba(112,0,255,0.1)'
        }}
      >
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '900', letterSpacing: '-1px', margin: '0', lineHeight: 1.1 }}>
          <span className="text-gradient">PRODUCER HUB.</span><br/>FIND YOUR SOUND.
        </h1>
      </motion.div>

      {/* 2. MEMBERSHIP CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card"
        style={{ padding: '30px', marginBottom: '60px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Star size={20} color="var(--text-secondary)" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Starter Member</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>VIP Έκπτωση: -</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#ccc' }}>
            Αγόρασε <strong>3 beats</strong> ακόμα για το <strong style={{ color: '#cd7f32' }}>Bronze (10%)</strong>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', position: 'relative', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '10%' }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'linear-gradient(90deg, var(--accent-magenta), #cd7f32)', borderRadius: '100px' }} 
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '1px' }}>
          <span>STARTER</span>
          <span style={{ color: '#cd7f32' }}>BRONZE</span>
        </div>
      </motion.div>

      {/* 3. VIBE SEARCH & GENRE FILTERS WITH VIEW TOGGLE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        
        {/* Top Row: Search & Dropdowns & View Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <button 
            className="btn-outline" 
            style={{ display: 'flex', gap: '12px', alignItems: 'center', borderColor: 'var(--accent-magenta)', color: 'var(--accent-magenta)', boxShadow: '0 0 15px rgba(255,0,127,0.2)' }}
          >
            <SlidersHorizontal size={18} /> VIBE SEARCH
          </button>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Dropdowns (BPM & KEY only) */}
            {['BPM', 'KEY'].map((filter, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px', display: 'none' }}>{filter}</span>
                <select style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '100px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
                  <option>{filter}: ALL</option>
                </select>
              </div>
            ))}

            {/* Divider */}
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => handleViewMode('grid')} 
                style={{ padding: '8px 12px', borderRadius: '100px', background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => handleViewMode('list')} 
                style={{ padding: '8px 12px', borderRadius: '100px', background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Horizontal Genre Pills */}
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => handleGenreSelect(genre)}
              style={{
                padding: '10px 24px',
                borderRadius: '100px',
                background: selectedGenre === genre ? 'var(--accent-magenta)' : 'rgba(255,255,255,0.05)',
                color: selectedGenre === genre ? 'white' : 'var(--text-secondary)',
                border: selectedGenre === genre ? '1px solid var(--accent-magenta)' : '1px solid rgba(255,255,255,0.1)',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: selectedGenre === genre ? '0 5px 15px rgba(255,0,127,0.3)' : 'none'
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 4. BEATS CATALOG (GRID OR LIST) */}
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <motion.div 
          key="grid"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', marginBottom: '40px' }}
        >
          {currentBeats.map((beat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = beat.color; e.currentTarget.style.boxShadow = `0 10px 30px ${beat.color}22`; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', background: `radial-gradient(circle, ${beat.color}44 0%, #050508 100%)`, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <div onClick={(e) => { e.stopPropagation(); if(beat.isReal) playTrack(beat); }} style={{ width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${beat.color}`, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', transition: 'transform 0.3s ease' }} className="play-btn">
                   {currentTrack?.title === beat.title && isPlaying ? <Pause size={24} color={beat.color} /> : <Play size={24} color={beat.color} style={{ marginLeft: '4px' }} />}
                 </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px' }}>{beat.title}</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {beat.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', fontWeight: '700', letterSpacing: '1px' }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div><span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Key</span><strong style={{ color: 'white' }}>{beat.key}</strong></div>
                    <div><span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>BPM</span><strong style={{ color: 'white' }}>{beat.bpm}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <strong style={{ fontSize: '1.2rem' }}>{beat.price}</strong>
                  <button onClick={(e) => { e.stopPropagation(); if(beat.isReal) openLicenseModal(beat); }} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center', borderColor: 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.background = beat.color; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = beat.color; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
                    ADD TO CART <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        /* LIST VIEW */
        <motion.div 
          key="list"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}
        >
          {currentBeats.map((beat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '24px', transition: 'all 0.2s ease', cursor: 'pointer', flexWrap: 'wrap' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              
              {/* Play Button & Thumb */}
              <div onClick={(e) => { e.stopPropagation(); if(beat.isReal) playTrack(beat); }} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '12px', background: beat.isReal && beat.cover ? `url(${beat.cover}) center/cover` : `radial-gradient(circle, ${beat.color}44 0%, #050508 100%)`, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                {currentTrack?.title === beat.title && isPlaying ? <Pause size={20} color={beat.color} /> : <Play size={20} color={beat.color} style={{ marginLeft: '2px' }} />}
              </div>

              {/* Title & Tags */}
              <div style={{ flexGrow: 1, minWidth: '200px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>{beat.title}</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {beat.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Tech Info */}
              <div style={{ display: 'flex', gap: '32px', color: 'var(--text-secondary)', fontSize: '0.9rem', minWidth: '120px', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>BPM</span> <strong style={{ color: 'white' }}>{beat.bpm}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>KEY</span> <strong style={{ color: 'white' }}>{beat.key}</strong></div>
              </div>

              {/* Price & Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0, minWidth: '140px', justifyContent: 'flex-end' }}>
                <strong style={{ fontSize: '1.1rem' }}>{beat.price}</strong>
                <button onClick={(e) => { e.stopPropagation(); if(beat.isReal) openLicenseModal(beat); }} className="btn-outline" style={{ padding: '10px 16px', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center', borderColor: 'rgba(255,255,255,0.2)', transition: 'all 0.3s', borderRadius: '100px' }} onMouseEnter={(e) => { e.currentTarget.style.background = beat.color; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = beat.color; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
                  <ShoppingCart size={16} />
                </button>
              </div>

            </div>
          ))}
        </motion.div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '100px' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            style={{ padding: '8px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', color: currentPage === 1 ? 'var(--text-secondary)' : 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
          >
            Prev
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: currentPage === idx + 1 ? 'var(--accent-magenta)' : 'transparent',
                  color: currentPage === idx + 1 ? 'white' : 'var(--text-secondary)',
                  border: currentPage === idx + 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  fontWeight: '800',
                  transition: 'all 0.2s'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            style={{ padding: '8px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', color: currentPage === totalPages ? 'var(--text-secondary)' : 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
          >
            Next
          </button>
        </div>
      )}

      {/* 5. LICENSING INFO */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>Licensing Info</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Επίλεξε την άδεια που καλύπτει τις ανάγκες σου.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '100px' }}>
        
        {/* Showcase License */}
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '50px', height: '50px', background: 'rgba(112,0,255,0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', color: 'var(--accent-violet)' }}>
            <Music size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>SHOWCASE LICENSE (MP3)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '32px' }}>$14.99</div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flexGrow: 1, fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-violet)' }}>✓</span> Used for Music Recording</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-violet)' }}>✓</span> Distribute up to 1,500 copies</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-violet)' }}>✓</span> 0 Online Audio Streams</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-violet)' }}>✓</span> 0 Music Video</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--accent-violet)' }}>✓</span> UNLIMITED Non-profit Live Performances</li>
          </ul>
        </div>

        {/* Premium License (Highlighted) */}
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', position: 'relative', border: '2px solid var(--accent-magenta)', boxShadow: '0 0 40px rgba(255,0,127,0.15)', transform: 'scale(1.05)', zIndex: 10 }}>
          <div style={{ position: 'absolute', top: '-1px', right: '-1px', background: 'var(--accent-magenta)', color: 'white', padding: '6px 24px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px', borderBottomLeftRadius: '16px', borderTopRightRadius: '14px' }}>BEST VALUE</div>
          <div style={{ width: '50px', height: '50px', background: 'rgba(255,0,127,0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', color: 'var(--accent-magenta)' }}>
            <Music size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>PREMIUM LICENSE (MP3+WAV)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '32px' }}>$39.99</div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flexGrow: 1, fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: 'var(--accent-magenta)' }}>✓</span> Used for Music Recording</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: 'var(--accent-magenta)' }}>✓</span> Distribute up to 3,000 copies</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: 'var(--accent-magenta)' }}>✓</span> 700,000 Online Audio Streams</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: 'var(--accent-magenta)' }}>✓</span> 1 Music Video</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: 'var(--accent-magenta)' }}>✓</span> For Profit Live Performances</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ color: 'var(--accent-magenta)' }}>✓</span> Radio Broadcasting (2 Stations)</li>
          </ul>
        </div>

        {/* Unlimited License */}
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', color: 'white' }}>
            <Music size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>UNLIMITED LICENSE (TRACKOUTS)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '32px' }}>$99.99</div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flexGrow: 1, fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'white' }}>✓</span> Used for Music Recording</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'white' }}>✓</span> UNLIMITED Distribution copies</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'white' }}>✓</span> UNLIMITED Online Audio Streams</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'white' }}>✓</span> UNLIMITED Music Videos</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'white' }}>✓</span> For Profit Live Performances</li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}><span style={{ color: 'white' }}>✓</span> Radio Broadcasting (UNLIMITED)</li>
          </ul>
        </div>
      </div>

      {/* 6. NEWSLETTER */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}
      >
        <div style={{ 
          position: 'relative',
          width: '100%', 
          maxWidth: '800px', 
          borderRadius: '30px',
          background: 'linear-gradient(145deg, #0a0a0f 0%, #050508 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '60px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
        }}>
          {/* Decorative Glowing Orb behind the form */}
          <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--accent-magenta)', filter: 'blur(150px)', opacity: 0.2, zIndex: 0, pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            <div>
              <span style={{ background: 'rgba(255,0,127,0.1)', color: 'var(--accent-magenta)', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Beatstore Newsletter</span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', marginTop: '24px', marginBottom: '12px' }}>Μείνε Συντονισμένος</h3>
            </div>

            {/* Custom Interactive Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
              {[
                { id: 'beats_news', label: 'Beats, Προσφορές & Νέα' },
                { id: 'beats_only', label: 'Μόνο Beats & Προσφορές' },
              ].map(radio => (
                <button 
                  key={radio.id}
                  onClick={() => setNewsletterType(radio.id)}
                  style={{ 
                    background: newsletterType === radio.id ? 'var(--accent-magenta)' : 'rgba(255,255,255,0.03)',
                    border: newsletterType === radio.id ? '1px solid var(--accent-magenta)' : '1px solid rgba(255,255,255,0.1)',
                    color: newsletterType === radio.id ? 'white' : 'var(--text-secondary)',
                    padding: '12px 24px',
                    borderRadius: '100px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: newsletterType === radio.id ? '0 10px 20px rgba(255,0,127,0.3)' : 'none'
                  }}
                >
                  {radio.label}
                </button>
              ))}
            </div>

            {/* Modern Input & Submit combination */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
              <input 
                type="email" 
                placeholder="Το email σου..." 
                style={{ 
                  width: '100%', 
                  padding: '20px 160px 20px 24px', 
                  borderRadius: '100px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white',
                  fontFamily: 'inherit',
                  outline: 'none',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'var(--accent-magenta)'; }}
                onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <button 
                style={{ 
                  position: 'absolute',
                  right: '6px',
                  top: '6px',
                  bottom: '6px',
                  background: 'var(--accent-magenta)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '0 32px',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
              >
                 ΕΓΓΡΑΦΗ
              </button>
            </div>

          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default Beats;
