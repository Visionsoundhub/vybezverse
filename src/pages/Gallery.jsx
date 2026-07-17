import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import galleryData from '../data/gallery.json';
import './Gallery.css';

function Gallery() {
  const reduce = useReducedMotion();
  const images = galleryData.images || [];

  return (
    <div className="gal container">
      <header className="gal-hero">
        <div className="gal-eyebrow">Gallery · Visual vibes</div>
        <h1 className="gal-title">GALLERY</h1>
      </header>

      <div className="gal-grid">
        {images.map((img, idx) => (
          <motion.figure
            key={idx}
            className="gal-item"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: reduce ? 0 : (idx % 3) * 0.06 }}
          >
            <div className="gal-frame">
              <img src={img.src} alt={img.caption || ''} loading="lazy" />
            </div>
            {img.caption && <figcaption className="gal-cap">{img.caption}</figcaption>}
          </motion.figure>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
