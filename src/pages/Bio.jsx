import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './Bio.css';

const timeline = [
  {
    year: '2008',
    title: 'Η Αφετηρία στη Λάρισα',
    body: (
      <>Τα πρώτα βήματα. Συνεργασίες με σχήματα-σταθμούς της τοπικής και όχι μόνο σκηνής, όπως οι <b>ΑΨ</b>, η <b>Στιχουργική Αναμέτρηση</b>, οι <b>LaCoast</b> και οι <b>2410 Squad</b>. Εκεί χτίστηκαν τα θεμέλια του ήχου.</>
    ),
  },
  {
    year: '2012',
    title: 'Η Εξέλιξη του Ήχου',
    body: 'Πειραματισμός με νέους ήχους και παραγωγές. Ανάπτυξη ενός χαρακτηριστικού beatmaking στιλ, συνδυάζοντας κλασικά hip-hop στοιχεία με μοντέρνα vibes.',
  },
  {
    year: '2018',
    title: 'Σόλο Καριέρα & Αναζήτηση',
    body: (
      <>Η χρονιά της μεγάλης αλλαγής. Στροφή στη σόλο καριέρα με νέους πειραματισμούς, αναζήτηση της προσωπικής ταυτότητας και πέρασμα από labels όπως η <b>Palmundo Music</b>.</>
    ),
  },
  {
    year: '2021',
    title: 'Το "SOS" & Η Επίδραση',
    body: 'Κυκλοφορία του κομματιού "SOS", το οποίο αγγίζει το ευαίσθητο θέμα της ενδοοικογενειακής βίας. Η ανταπόκριση οδηγεί σε μεγάλες τηλεοπτικές συνεντεύξεις (Star, ΑΝΤ1), αποδεικνύοντας ότι η φωνή της μουσικής έχει κοινωνική δύναμη.',
  },
  {
    year: 'Σήμερα',
    title: 'Flowless Music & Ανεξαρτησία',
    now: true,
    body: (
      <>Μετά την ίδρυση της <b>LANDING MIND RECORDS</b>, το επόμενο μεγάλο κεφάλαιο είναι η <b>flowless music</b>. Ως ιδρυτής (μαζί με τον Evoid), συνεχίζω να χαράζω έναν 100% ανεξάρτητο δρόμο, συνδυάζοντας την παραγωγή, το ραπ και το podcasting.</>
    ),
  },
];

function Bio() {
  const reduce = useReducedMotion();
  const rise = reduce
    ? {}
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } };

  return (
    <div className="bio">
      {/* HERO */}
      <section className="bio-hero container">
        <span className="bio-ghost" aria-hidden="true">BLACK VYBEZ</span>
        <div className="bio-eyebrow">Bio · Producer · Λάρισα / Αθήνα → ∞</div>
        <h1 className="bio-title">BLACK VYBEZ</h1>
        <div className="bio-realname">Θοδωρής Παρασχάκης «Ντόμας»</div>
      </section>

      <div className="container bio-body">
        {/* MISSION */}
        <motion.div className="bio-mission" {...rise}>
          <div className="bio-mission-k">The Mission</div>
          <p className="bio-mission-q">
            «Στόχος μου είναι να δείξω στον κόσμο που βιώνει τη νευροδιαφορετικότητα ότι <span>δεν είναι μόνοι</span>.»
          </p>
          <p className="bio-mission-sub">
            Γεννημένος στο Μεξικό, μεγαλωμένος στην Ελλάδα. Μουσικός παραγωγός, ράπερ, σύζυγος και πατέρας δύο παιδιών.
          </p>
        </motion.div>

        {/* TIMELINE */}
        <div className="bio-timeline">
          {timeline.map((t) => (
            <motion.div key={t.year} className={`bio-tl-item${t.now ? ' now' : ''}`} {...rise}>
              <span className="bio-tl-dot" />
              <div className="bio-tl-year">{t.year}</div>
              <h3 className="bio-tl-title">{t.title}</h3>
              <p className="bio-tl-body">{t.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Bio;
