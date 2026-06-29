import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { Play, Heart, Mic2, Disc3, Ticket, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import beatsDataRaw from '../data/beats.json';
import { AudioContext } from '../context/AudioContext';

const sectionsList = [
  { id: 'hero', label: '01. INTRO' },
  { id: 'album', label: '02. ΠΑΛΙΡΡΟΙΑ' },
  { id: 'latest', label: '03. LATEST DROP' },
  { id: 'charity', label: '04. CHARITY' },
  { id: 'beats', label: '05. NEW BEATS' },
  { id: 'live', label: '06. LIVE SHOWS' }
];

const StickySection = ({ children, bg, index, zIndex, id }) => (
  <section 
    id={id}
    className="scroll-section sticky-section-wrapper"
    style={{ 
      minHeight: '100vh', 
      background: bg,
      zIndex: zIndex,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      transform: 'translateZ(0)',
      willChange: 'transform',
      WebkitFontSmoothing: 'antialiased',
      backfaceVisibility: 'hidden'
    }}
  >
    <div className="container" style={{ width: '100%' }}>
      {children}
    </div>
  </section>
);

function Home() {
  const { playTrack, currentTrack, isPlaying, openLicenseModal } = React.useContext(AudioContext);
  const [activeSection, setActiveSection] = useState('hero');
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const totalFrames = 300;

  // Track active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      const index = Math.min(
        sectionsList.length - 1,
        Math.max(0, Math.floor((scrollY + vh / 2) / vh))
      );
      
      setActiveSection(sectionsList[index].id);
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload Images for Canvas
  useEffect(() => {
    const images = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `/ezgif-8a8f85f21e3368a5-jpg/ezgif-frame-${paddedIndex}.jpg`;
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Apple-Style Canvas Scrubbing
  useEffect(() => {
    let animationFrameId;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const images = imagesRef.current;
      
      if (canvas && images.length > 0) {
        const ctx = canvas.getContext('2d');
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        
        // Progress 0 to 1 as we scroll down
        const progress = Math.min(Math.max(scrollY / vh, 0), 1);
        
        // FORWARD PLAYBACK
        let frameIndex = Math.floor(progress * (totalFrames - 1));
        frameIndex = Math.max(0, Math.min(frameIndex, totalFrames - 1));
        
        const img = images[frameIndex];
        
        if (img && img.complete && img.naturalWidth > 0) {
          canvas.width = 800; 
          canvas.height = 800;
          
          const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
          const x = (canvas.width / 2) - (img.naturalWidth / 2) * scale;
          const y = (canvas.height / 2) - (img.naturalHeight / 2) * scale;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
    const intervalId = setInterval(renderLoop, 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
    };
  }, []);

  const scrollTo = (id) => {
    const index = sectionsList.findIndex(sec => sec.id === id);
    if (index !== -1) {
      window.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  const { scrollY } = useScroll();
  
  const textY = useTransform(scrollY, [0, 500], [0, 150]);
  const textOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div style={{ position: 'relative' }}>
      
      {/* SIDE NAVIGATION */}
      <div className="side-nav" style={{ position: 'fixed', right: '40px', top: '50%', transform: 'translateY(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sectionsList.map((sec) => (
          <div 
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end', 
              gap: '16px', 
              cursor: 'pointer',
              opacity: activeSection === sec.id ? 1 : 0.4,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={(e) => { if (activeSection !== sec.id) e.currentTarget.style.opacity = 0.4; }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', color: activeSection === sec.id ? 'var(--accent-magenta)' : 'white' }}>
              {sec.label}
            </span>
            <div style={{ 
              width: activeSection === sec.id ? '24px' : '8px', 
              height: '2px', 
              background: activeSection === sec.id ? 'var(--accent-magenta)' : 'white',
              transition: 'all 0.3s ease'
            }} />
          </div>
        ))}
      </div>

      {/* 1. HERO SECTION */}
      <StickySection id="hero" bg="var(--bg-color)" zIndex={1}>
        <div className="hero-content-wrapper">
          
          {/* LAYOUT PLACEHOLDER: Keeps the layout stable */}
          <div style={{ width: 'min(90vw, 400px)', height: 'min(90vw, 400px)', marginBottom: 'clamp(-20px, -5vw, -80px)', marginTop: 'clamp(10px, 2vh, 40px)', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 0 }}>
            
            <motion.div 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%',
                position: 'absolute',
                zIndex: 0,
                overflow: 'hidden',
                background: 'radial-gradient(circle, rgba(112,0,255,0.2) 0%, rgba(5,5,8,0) 70%)',
                boxShadow: '0 0 50px rgba(112,0,255,0.3)'
              }}
            >
               {/* APPLE-STYLE CANVAS SCRUBBING */}
               <canvas 
                 ref={canvasRef}
                 style={{ width: '100%', height: '100%', mixBlendMode: 'luminosity', borderRadius: '50%' }}
               />
            </motion.div>

          </div>

          <motion.h1 
            style={{ 
              y: textY,
              opacity: textOpacity,
              position: 'relative', 
              zIndex: 1, 
              textShadow: '0 10px 30px rgba(0,0,0,0.8)' 
            }}
            className="text-gradient hero-main-title"
          >
            BLACK VYBEZ
          </motion.h1>
          
          <motion.p 
             style={{ 
               y: textY,
               opacity: textOpacity,
               position: 'relative',
               zIndex: 1,
               textShadow: '0 0 20px rgba(255,0,127,0.5)' 
             }}
             className="hero-sub-title"
          >
            PRODUCER <span style={{ color: 'var(--text-secondary)', margin: '0 12px' }}>×</span> VYBEZMADETHIS
          </motion.p>
        </div>
      </StickySection>

      {/* 2. ALBUM TEASER: ΠΑΛΙΡΡΟΙΑ */}
      <StickySection id="album" bg="radial-gradient(circle at center, #0a1128 0%, #050508 100%)" zIndex={2}>
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <span style={{ color: '#4cc9f0', letterSpacing: '4px', fontSize: '0.9rem', marginBottom: '16px', fontWeight: '700' }}>ΝΕΟ ALBUM / COMING SOON</span>
          <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: '800', letterSpacing: '-2px', color: '#fff', textShadow: '0 0 40px rgba(76, 201, 240, 0.4)' }}>
            ΠΑΛΙΡΡΟΙΑ
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '500px', fontSize: '1.2rem', lineHeight: 1.6, marginTop: '24px' }}>
            Το νερό δεν ρωτάει. Απλά παρασέρνει τα πάντα. Το νέο κεφάλαιο ανοίγει σύντομα.
          </p>
        </motion.div>
      </StickySection>

      {/* 3. LATEST DROP */}
      <StickySection id="latest" bg="var(--bg-secondary)" zIndex={3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1', borderRadius: '24px', background: 'radial-gradient(circle, #2a0845 0%, #050508 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
          >
            <span style={{ color: '#ffcc00', fontFamily: 'Brush Script MT, cursive', fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>Jazz Bar</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ maxWidth: '400px' }}
          >
            <span style={{ display: 'inline-block', background: 'var(--accent-magenta)', color: '#fff', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '16px' }}>LATEST DROP</span>
            <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', lineHeight: 1.1, marginBottom: '16px' }}>Jazz Bar των τεράτων</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Το απόλυτο single από τη σειρά Vintage Freq. Συντονίσου.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
               <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Play size={18} /> STREAM NOW</button>
               <button className="btn-outline">VIEW BUNDLE</button>
            </div>
          </motion.div>

        </div>
      </StickySection>

      {/* 4. CHARITY STATEMENT */}
      <StickySection id="charity" bg="radial-gradient(circle at center, #1a0510 0%, #050508 100%)" zIndex={4}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', color: '#fff', padding: '40px' }}
        >
          <Heart size={48} color="var(--accent-magenta)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '800', letterSpacing: '-1px', marginBottom: '24px', lineHeight: 1.2, textShadow: '0 0 30px rgba(255,0,127,0.4)' }}>
            Η ΜΟΥΣΙΚΗ<br/>ΕΠΙΣΤΡΕΦΕΙ
          </h2>
          <p style={{ fontSize: '1.5rem', fontWeight: '500', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Όλα τα έσοδα από τα streams στο Spotify πηγαίνουν απευθείας σε φιλανθρωπικό οργανισμό. 
            Ακούγοντας, βοηθάς.
          </p>
          <button className="btn-primary" style={{ marginTop: '40px', background: '#1db954', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', margin: '40px auto 0' }}>
            <Play size={18} /> ΑΚΟΥ ΣΤΟ SPOTIFY
          </button>
        </motion.div>
      </StickySection>

      {/* 5. NEW BEATS */}
      <StickySection id="beats" bg="var(--bg-color)" zIndex={5}>
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '16px' }}
          >
            <div>
              <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', gap: '16px' }}><Disc3 size={40} /> NEW BEATS</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Φρέσκα instrumentals έτοιμα για vocals.</p>
            </div>
            <Link to="/beats" style={{ color: 'var(--accent-magenta)', textDecoration: 'none', fontWeight: '800' }}>GO TO BEATSTORE →</Link>
          </motion.div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {beatsDataRaw.beatslist.slice(0, 3).map((beat, i) => (
              <motion.div 
                key={beat.title}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card" 
                style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => playTrack(beat)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', border: 'none', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                    {currentTrack?.title === beat.title && isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                  </button>
                  <div>
                    <h3 style={{ fontSize: '1.2rem' }}>{beat.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{beat.bpm || 120} BPM • {beat.key || 'Am'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                   <span style={{ fontSize: '0.8rem', color: 'var(--accent-violet)' }}>{(beat.tags || []).join(', ')}</span>
                   <button onClick={(e) => { e.stopPropagation(); openLicenseModal(beat); }} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>BUY LEASE</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </StickySection>

      {/* 6. LIVE SHOWS */}
      <StickySection id="live" bg="var(--bg-secondary)" zIndex={6}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', padding: 'clamp(30px, 6vw, 60px)', border: '1px dashed var(--accent-magenta)', borderRadius: '24px', background: 'rgba(255,0,127,0.02)', maxWidth: '600px', margin: '0 auto' }}
          >
            <Ticket size={48} color="var(--accent-magenta)" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '16px' }}>LIVE SHOWS</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '32px' }}>
            Η σκηνή ετοιμάζεται. Οι επόμενες ζωντανές εμφανίσεις θα ανακοινωθούν σύντομα.
          </p>
          <div style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontWeight: '800', letterSpacing: '2px', color: 'var(--text-secondary)' }}>
            STAY TUNED
          </div>
        </motion.div>
      </StickySection>

    </div>
  );
}

export default Home;
