import React from 'react';
import { motion } from 'framer-motion';
import galleryData from '../data/gallery.json';
import './Gallery.css';

const Gallery = () => {
  return (
    <div className="gallery-page container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>GALLERY</h1>
        <p>Visual vibes</p>
      </motion.div>

      <div className="gallery-grid">
        {galleryData.images.map((img, idx) => (
          <motion.div 
            key={idx}
            className="gallery-item glass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="gallery-img-wrapper">
              <img src={img.src} alt={img.caption} />
            </div>
            <div className="gallery-caption">
              <p>{img.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
