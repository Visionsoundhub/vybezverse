import React from 'react';
import { Mic, Play, Headphones, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

function Podcasts() {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      
      {/* 1. HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,0,127,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', border: '1px solid rgba(255,0,127,0.3)', boxShadow: '0 0 30px rgba(255,0,127,0.2)' }}>
           <Mic size={32} color="var(--accent-magenta)" />
        </div>
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px' }}>
          <span className="text-gradient">THE PODCAST.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Η φωνή πίσω από τη μουσική. Συζητήσεις, αλήθειες και η ζωή ως καλλιτέχνης & πατέρας.</p>
      </motion.div>

      {/* 2. FEATURED SHOW SPOTLIGHT */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="glass-card"
        style={{ 
          padding: '0', 
          overflow: 'hidden', 
          marginBottom: '80px', 
          border: '1px solid var(--accent-magenta)',
          display: 'flex',
          flexWrap: 'wrap',
          boxShadow: '0 20px 50px rgba(255,0,127,0.1)'
        }}
      >
        {/* Cover Art Image Box */}
        <div style={{ flex: '1 1 400px', background: 'radial-gradient(circle at center, #1a0b1a 0%, #050508 100%)', minHeight: '400px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
           <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'white', color: 'black', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '900' }}>ΝΕΟ PODCAST</div>
           
           {/* Mockup of Podcast Cover */}
           <div style={{ width: '80%', aspectRatio: '1/1', background: 'linear-gradient(45deg, var(--accent-magenta), var(--accent-violet))', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', textAlign: 'center' }}>
             <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', lineHeight: 1.1 }}>ΜΠΑΜΠΑΣ ΤΩΝ 2 <br/>& RAPPER</h2>
             <div style={{ marginTop: '16px', width: '40px', height: '4px', background: 'white', borderRadius: '4px' }}></div>
           </div>
        </div>
        
        {/* Info Box */}
        <div style={{ flex: '1 1 400px', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-magenta)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '16px' }}>
            <Headphones size={18} /> THE BLACK VYBEZ SHOW
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '24px', lineHeight: 1.2 }}>Μπαμπάς των 2 <br/>& Rapper (Πρεμιέρα)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Πώς είναι να είσαι γονιός δύο παιδιών, δημιουργός και ράπερ όταν ζεις με <strong>ΔΕΠΥ (ADHD)</strong>; 
            Μια ανοιχτή, ειλικρινής συζήτηση για τις προκλήσεις, την έμπνευση και το πώς η νευροδιαφορετικότητα διαμορφώνει 
            τη μουσική και την καθημερινότητά μου. Δεν είμαστε μόνοι.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px', background: 'white', color: 'black' }}>
              <Play size={20} fill="black" /> ΑΚΟΥΣΕ ΤΟ ΤΩΡΑ
            </button>
            <button className="btn-outline" style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
              <Heart size={24} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. EPISODES LIST */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', paddingLeft: '16px' }}>Παλαιότερα Επεισόδια</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { num: '03', title: 'Flawless Music: Το Ξεκίνημα', desc: 'Πώς στήσαμε το ανεξάρτητο label με τον Evoid.', dur: '42:15' },
            { num: '02', title: 'Πίσω από τις Παραγωγές', desc: 'Η διαδικασία δημιουργίας των beats και τι ψάχνω στον ήχο μου.', dur: '38:00' },
            { num: '01', title: 'The SOS Message', desc: 'Η ιστορία πίσω από το "SOS" και η ενδοοικογενειακή βία.', dur: '55:30' }
          ].map((ep, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, fontWeight: '900', color: 'var(--accent-magenta)' }}>
                {ep.num}
              </div>
              
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>{ep.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ep.desc}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '700' }}>{ep.dur}</span>
                <button className="btn-outline" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                  <Play size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Podcasts;
