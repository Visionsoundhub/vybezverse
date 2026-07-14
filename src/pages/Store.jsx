import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

function Store() {
  const reduce = useReducedMotion();
  return (
    <div className="container" style={{ minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px', paddingBottom: '120px' }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 22 }}
        animate={reduce ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: 640 }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--accent)', fontSize: '.85rem', marginBottom: 22 }}>Merch</div>
        <ShoppingBag size={38} color="var(--accent)" style={{ marginBottom: 22 }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,10vw,6.5rem)', lineHeight: 0.92, letterSpacing: '-.02em', margin: 0 }}>
          Coming <span style={{ color: 'var(--accent)' }}>soon</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.15rem', lineHeight: 1.6, marginTop: 24, maxWidth: '44ch', marginInline: 'auto' }}>
          Το επίσημο apparel ετοιμάζεται. Σύντομα κάθε κομμάτι θα ανοίγει σαν gallery — όχι απλό thumbnail.
        </p>
      </motion.div>
    </div>
  );
}

export default Store;
