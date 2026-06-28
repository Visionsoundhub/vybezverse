import React from 'react';
import { ArrowRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

function Press() {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ padding: '120px 24px 60px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5rem)', fontWeight: '900', letterSpacing: '-1px', marginBottom: '24px' }}>
          IN THE <span className="text-gradient">HEADLINES</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Τηλεοπτικές εμφανίσεις, συνεντεύξεις, και το κοινωνικό αποτύπωμα του Black Vybez στα media.
        </p>
      </div>



      {/* 3. EDITORIAL ARTICLES GRID */}
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
          
          {/* Article 1: Star.gr */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}>
            <div style={{ width: '100%', height: '280px', position: 'relative', overflow: 'hidden', background: '#111' }}>
              <img src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?q=80&w=800&auto=format&fit=crop" alt="Press" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'var(--accent-magenta)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>ΣΥΝΕΝΤΕΥΞΗ</div>
            </div>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-violet)', fontWeight: '800' }}>Star.gr</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>2021</span>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '24px', lineHeight: 1.2 }}>Το κοινωνικό μήνυμα πίσω από το 'SOS'</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px', flexGrow: 1 }}>
                Ο Black Vybez μιλάει ανοιχτά για την ενδοοικογενειακή βία, αναλύοντας πώς το κομμάτι "SOS" 
                δεν είναι απλά ραπ, αλλά μια κραυγή αγωνίας.
              </p>
              <div style={{ color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', transition: 'gap 0.3s' }} className="read-more">
                ΔΙΑΒΑΣΕ ΤΟ ΑΡΘΡΟ <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

          {/* Article 2: Το Πρωινό */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}>
            <div style={{ width: '100%', height: '280px', position: 'relative', overflow: 'hidden', background: '#111' }}>
              <img src="https://images.unsplash.com/photo-1593951230137-0f8f8f2b7a48?q=80&w=800&auto=format&fit=crop" alt="TV Show" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, transition: 'transform 0.5s ease' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'var(--accent-violet)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>ΤΗΛΕΟΡΑΣΗ</div>
            </div>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-violet)', fontWeight: '800' }}>Το Πρωινό (ANT1)</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>2021</span>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '24px', lineHeight: 1.2 }}>Καλεσμένος στο "Πρωινό"</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px', flexGrow: 1 }}>
                Ο Θοδωρής Παρασχάκης στο πλατό της εκπομπής, αναλύοντας το πώς εμπνεύστηκε το τραγούδι "SOS" 
                και την ανταπόκριση του κόσμου.
              </p>
              <div style={{ color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', transition: 'gap 0.3s' }} className="read-more">
                ΔΕΣ ΤΟ ΒΙΝΤΕΟ <ArrowRight size={18} />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      
    </div>
  );
}

export default Press;
