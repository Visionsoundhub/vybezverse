import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, ExternalLink, Heart, CheckCircle2, Disc3, Mic2, Send } from 'lucide-react';

function Releases() {
  const [activeTab, setActiveTab] = useState('singles');
  const [newsletterType, setNewsletterType] = useState('all');

  // Dummy Data for Singles
  const singles = [
    { title: "Jazz Bar των τεράτων", tag: "Vintage Freq", type: "Single" },
    { title: "Neon Nights", tag: "Dark Synth", type: "Single" },
    { title: "Midnight Drive", tag: "Trap / Drill", type: "Single" },
    { title: "Lost In Translation", tag: "R&B / Soul", type: "Single" },
  ];

  // Dummy Data for Albums
  const albums = [
    { title: "ΠΑΛΙΡΡΟΙΑ", tag: "Studio Album", type: "Album", tracks: 12 },
    { title: "THE BEAT TAPE VOL.1", tag: "Instrumental", type: "EP", tracks: 5 },
  ];

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      
      {/* 1. HERO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <h1 className="text-gradient" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '16px', fontWeight: '900', letterSpacing: '-2px' }}>
          MUSIC CATALOG
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Κάθε κομμάτι είναι μια διαφορετική συχνότητα. 
          Χρησιμοποίησε τα φίλτρα & Συντονίσου στη συχνότητα που ψάχνεις.
        </p>
      </motion.div>

      {/* 2. TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
        <button 
          onClick={() => setActiveTab('singles')}
          style={{ 
            padding: '12px 32px', 
            borderRadius: '100px', 
            background: activeTab === 'singles' ? 'var(--accent-magenta)' : 'rgba(255,255,255,0.05)',
            color: 'white',
            border: activeTab === 'singles' ? '1px solid rgba(255,0,127,0.5)' : '1px solid rgba(255,255,255,0.1)',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'singles' ? '0 0 20px rgba(255,0,127,0.3)' : 'none'
          }}
        >
          <Mic2 size={18} /> SINGLES
        </button>
        <button 
          onClick={() => setActiveTab('albums')}
          style={{ 
            padding: '12px 32px', 
            borderRadius: '100px', 
            background: activeTab === 'albums' ? 'var(--accent-violet)' : 'rgba(255,255,255,0.05)',
            color: 'white',
            border: activeTab === 'albums' ? '1px solid rgba(112,0,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'albums' ? '0 0 20px rgba(112,0,255,0.3)' : 'none'
          }}
        >
          <Disc3 size={18} /> EPs / ALBUMS
        </button>
      </div>

      {/* 3. RELEASES GRID */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: activeTab === 'singles' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(380px, 1fr))', 
            gap: '32px',
            marginBottom: '100px'
          }}
        >
          {(activeTab === 'singles' ? singles : albums).map((item, idx) => (
             <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
               
               {/* Cover Image Placeholder */}
               <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', background: activeTab === 'singles' ? 'radial-gradient(circle, #2a0845 0%, #050508 100%)' : 'radial-gradient(circle, #4a00e0 0%, #8e2de2 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.2)', position: 'relative', overflow: 'hidden' }}>
                 <span style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.1)' }}>
                   {item.type}
                 </span>
                 <Disc3 size={64} opacity={0.5} />
               </div>
               
               <div>
                 <h3 style={{ fontSize: '1.4rem', marginBottom: '4px', fontWeight: '800' }}>{item.title}</h3>
                 <p style={{ color: activeTab === 'singles' ? 'var(--accent-magenta)' : 'var(--accent-violet)', fontWeight: '600', fontSize: '0.9rem' }}>{item.tag}</p>
                 {item.tracks && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '8px' }}>{item.tracks} Tracks</p>}
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button className="btn-outline" style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px' }}><Play size={16} /> Stream</button>
                  <button className="btn-outline" style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px' }}><Download size={16} /> Bundle</button>
               </div>
             </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* 4. THE "SUPPORT THE ARTIST" BUNDLE BANNER (MERGED) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card" 
        style={{ 
          marginBottom: '100px', 
          padding: '0', 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          overflow: 'hidden',
          border: '1px solid rgba(255,0,127,0.3)',
          boxShadow: '0 20px 50px rgba(255,0,127,0.1)'
        }}
      >
        <div style={{ flex: '1 1 400px', padding: '60px', background: 'radial-gradient(circle at top left, rgba(255,0,127,0.1) 0%, transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Heart size={40} color="var(--accent-magenta)" fill="var(--accent-magenta)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px', lineHeight: 1.1 }}>
            ΣΤΗΡΙΞΕ ΤΗΝ <br/><span className="text-gradient">ΑΝΕΞΑΡΤΗΤΗ</span> ΜΟΥΣΙΚΗ
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.1rem', marginBottom: '0' }}>
            Οι πλατφόρμες streaming πληρώνουν ελάχιστα. Η απευθείας αγορά ενός τραγουδιού ισοδυναμεί με χιλιάδες streams και δίνει ζωή στη δημιουργία. Γι' αυτό κάθε αγορά σου έρχεται με το απόλυτο πακέτο.
          </p>
        </div>

        <div style={{ flex: '1 1 400px', padding: '60px', background: 'rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '2px', color: 'white', marginBottom: '24px' }}>ΤΙ ΠΑΙΡΝΕΙΣ ΣΤΟ BUNDLE:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              "High Quality Audio (320kbps/WAV)", 
              "Εναλλακτικές Εκδόσεις", 
              "Exclusive Ringtones", 
              "Signed Digital Artwork", 
              "Χειρόγραφοι Στίχοι", 
              "BTS & Studio Video"
            ].map((item, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '12px', 
                padding: '16px', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-magenta)'; e.currentTarget.style.background = 'rgba(255,0,127,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <CheckCircle2 size={20} color="var(--accent-magenta)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e0e0e0', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 5. EXTREME NEWSLETTER VIP SECTION */}
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
          <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--accent-violet)', filter: 'blur(150px)', opacity: 0.3, zIndex: 0, pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            <div>
              <span style={{ background: 'rgba(112,0,255,0.2)', color: '#b886ff', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>VIP Inner Circle</span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', marginTop: '24px', marginBottom: '12px' }}>Μείνε Συντονισμένος</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>Γίνε ο πρώτος που μαθαίνει για νέα drops, exclusive beats και secret events.</p>
            </div>

            {/* Custom Interactive Chips instead of ugly Radio Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
              {[
                { id: 'all', label: 'Όλα (Beats & Μουσική)' },
                { id: 'beats', label: 'Μόνο Beats' },
                { id: 'releases', label: 'Μόνο Κυκλοφορίες' }
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
                placeholder="Εισάγετε το email σας..." 
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
                onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'var(--accent-violet)'; }}
                onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <button 
                style={{ 
                  position: 'absolute',
                  right: '6px',
                  top: '6px',
                  bottom: '6px',
                  background: 'white',
                  color: 'black',
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
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.background = '#e0e0e0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'white'; }}
              >
                 JOIN <Send size={16} />
              </button>
            </div>

          </div>
        </div>
      </motion.div>

    </div>
  );
}

export default Releases;
