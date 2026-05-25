import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import bioData from '../data/bio.json';
import './Bio.css';

function renderContent(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const lines = part.split('\n');
    return lines.map((line, j) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < lines.length - 1 && <br />}
      </span>
    ));
  });
}

function Bio() {
  return (
    <div className="bio-page">
      <div className="bio-container">
        {/* Decorative background elements */}
        <div className="bio-glow bio-glow-1" />
        <div className="bio-glow bio-glow-2" />

        <motion.div
          className="bio-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Profile Image */}
          <motion.div
            className="bio-image-wrapper"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bio-image-ring">
              <div className="bio-image-ring-inner">
                <img
                  src={bioData.image}
                  alt={bioData.title}
                  className="bio-image"
                />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            className="bio-title-section"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bio-title-icon">
              <Sparkles size={28} />
            </div>
            <h1 className="bio-title">{bioData.title}</h1>
            <div className="bio-title-line" />
          </motion.div>
        </motion.div>

        {/* Content Card */}
        <motion.div
          className="bio-card glass"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="bio-card-accent" />
          <div className="bio-content">
            <p className="bio-text">{renderContent(bioData.content)}</p>
          </div>
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          className="bio-footer-icon"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <User size={20} />
          <span>VybezVerse</span>
        </motion.div>
      </div>
    </div>
  );
}

export default Bio;
