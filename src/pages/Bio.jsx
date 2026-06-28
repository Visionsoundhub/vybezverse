import React from 'react';
import { motion } from 'framer-motion';

function Bio() {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ position: 'relative', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <h1 style={{ position: 'absolute', top: '40%', fontSize: 'clamp(5rem, 15vw, 12rem)', fontWeight: '900', color: 'rgba(255,255,255,0.03)', whiteSpace: 'nowrap', zIndex: 0, userSelect: 'none' }}>
          BLACK VYBEZ
        </h1>
        
        {/* Placeholder for Artist Portrait */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          style={{ width: '400px', height: '500px', background: 'radial-gradient(ellipse at top, #2a2a35 0%, #0a0a0f 100%)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 1, boxShadow: '0 30px 60px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '40px 30px' }}
        >
           <h2 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '2px', textAlign: 'center', margin: '0 0 12px 0', lineHeight: 1 }}>BLACK VYBEZ</h2>
           <span style={{ fontSize: '0.9rem', color: 'var(--accent-magenta)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>ΘΟΔΩΡΗΣ ΠΑΡΑΣΧΑΚΗΣ ΝΤΟΜΑΣ</span>
        </motion.div>
      </div>

      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* 2. THE MISSION (NEURODIVERGENCE) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card"
          style={{ padding: '60px', marginBottom: '80px', textAlign: 'center', border: '2px solid var(--accent-magenta)', boxShadow: '0 0 50px rgba(255,0,127,0.15)' }}
        >
          <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-magenta)', fontWeight: '800', letterSpacing: '2px', marginBottom: '24px' }}>THE MISSION</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: 1.5, color: 'white' }}>
            "Στόχος μου είναι να δείξω στον κόσμο που βιώνει τη νευροδιαφορετικότητα ότι <span style={{ color: 'var(--accent-magenta)' }}>δεν είναι μόνοι</span>."
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '24px' }}>
            Γεννημένος στο Μεξικό, μεγαλωμένος στην Ελλάδα. Μουσικός παραγωγός, ράπερ, σύζυγος και πατέρας δύο παιδιών.
          </p>
        </motion.div>

        {/* 3. THE TIMELINE */}
        <div style={{ position: 'relative', paddingLeft: '40px' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', left: '11px', top: '0', bottom: '0', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>

          {/* Timeline Item: 2008 */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ position: 'relative', marginBottom: '60px' }}>
            <div style={{ position: 'absolute', left: '-38px', top: '6px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '4px solid var(--bg-main)' }}></div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>2008</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>Η Αφετηρία στη Λάρισα</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Τα πρώτα βήματα. Συνεργασίες με σχήματα-σταθμούς της τοπικής και όχι μόνο σκηνής, όπως οι <strong style={{ color: 'white' }}>ΑΨ</strong>, η <strong style={{ color: 'white' }}>Στιχουργική Αναμέτρηση</strong>, οι <strong style={{ color: 'white' }}>LaCoast</strong> και οι <strong style={{ color: 'white' }}>2410 Squad</strong>. Εκεί χτίστηκαν τα θεμέλια του ήχου.
            </p>
          </motion.div>

          {/* Timeline Item: 2012 */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ position: 'relative', marginBottom: '60px' }}>
            <div style={{ position: 'absolute', left: '-38px', top: '6px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '4px solid var(--bg-main)' }}></div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>2012</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>Η Εξέλιξη του Ήχου</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Πειραματισμός με νέους ήχους και παραγωγές. Ανάπτυξη ενός χαρακτηριστικού beatmaking στιλ, συνδυάζοντας κλασικά hip-hop στοιχεία με μοντέρνα vibes.
            </p>
          </motion.div>

          {/* Timeline Item: 2018 */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ position: 'relative', marginBottom: '60px' }}>
            <div style={{ position: 'absolute', left: '-38px', top: '6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-violet)', border: '4px solid var(--bg-main)' }}></div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>2018</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>Σόλο Καριέρα & Αναζήτηση</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Η χρονιά της μεγάλης αλλαγής. Στροφή στη σόλο καριέρα με νέους πειραματισμούς, αναζήτηση της προσωπικής ταυτότητας και πέρασμα από labels όπως η <strong style={{ color: 'white' }}>Palmundo Music</strong>.
            </p>
          </motion.div>

          {/* Timeline Item: 2021 */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ position: 'relative', marginBottom: '60px' }}>
            <div style={{ position: 'absolute', left: '-38px', top: '6px', width: '20px', height: '20px', borderRadius: '50%', background: '#cd7f32', border: '4px solid var(--bg-main)' }}></div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>2021</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>Το "SOS" & Η Επίδραση</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Κυκλοφορία του κομματιού "SOS", το οποίο αγγίζει το ευαίσθητο θέμα της ενδοοικογενειακής βίας. Η ανταπόκριση οδηγεί σε μεγάλες τηλεοπτικές συνεντεύξεις (Star, ΑΝΤ1), αποδεικνύοντας ότι η φωνή της μουσικής έχει κοινωνική δύναμη.
            </p>
          </motion.div>

          {/* Timeline Item: Today */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-42px', top: '4px', width: '28px', height: '28px', borderRadius: '50%', background: 'white', border: '4px solid var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--accent-magenta)', borderRadius: '50%' }}></div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-magenta)', marginBottom: '8px' }}>ΣΗΜΕΡΑ</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>Flawless Music & Ανεξαρτησία</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Μετά την ίδρυση της <strong style={{ color: 'white' }}>LANDING MIND RECORDS</strong>, το επόμενο μεγάλο κεφάλαιο είναι η <strong style={{ color: 'white' }}>flawless music</strong>. Ως ιδρυτής (μαζί με τον Evoid), συνεχίζω να χαράζω έναν 100% ανεξάρτητο δρόμο, συνδυάζοντας την παραγωγή, το ραπ και το podcasting.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default Bio;
