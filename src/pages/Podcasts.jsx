import { motion } from 'framer-motion';
import { Headphones, Play, Clock, Mic } from 'lucide-react';
import podcastsData from '../data/podcasts.json';
import './Podcasts.css';

function Podcasts() {
  const episodes = podcastsData.episodes || [];
  const hasEpisodes = episodes.length > 1 || (episodes.length === 1 && episodes[0].title !== 'placeholder');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="podcasts-page">
      <div className="podcasts-glow podcasts-glow-1" />
      <div className="podcasts-glow podcasts-glow-2" />

      <div className="podcasts-container">
        {/* Header */}
        <motion.div
          className="podcasts-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="podcasts-header-icon">
            <Mic size={32} />
          </div>
          <h1 className="podcasts-title">Podcasts</h1>
          <p className="podcasts-subtitle">Ακούστε τα τελευταία επεισόδια</p>
          <div className="podcasts-title-line" />
        </motion.div>

        {hasEpisodes ? (
          <motion.div
            className="podcasts-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {episodes.map((episode, index) => (
              <motion.div
                key={index}
                className="podcasts-card glass"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="podcasts-card-image-wrapper">
                  <img
                    src={episode.cover}
                    alt={episode.title}
                    className="podcasts-card-image"
                  />
                  <div className="podcasts-card-play-overlay">
                    <Play size={28} fill="#fff" />
                  </div>
                </div>

                <div className="podcasts-card-content">
                  <h3 className="podcasts-card-title">{episode.title}</h3>
                  <p className="podcasts-card-description">{episode.description}</p>

                  <div className="podcasts-card-footer">
                    <span className="podcasts-card-date">
                      <Clock size={14} />
                      {episode.date}
                    </span>
                    <a
                      href={episode.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="podcasts-card-listen"
                    >
                      <Headphones size={16} />
                      Ακούστε
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Coming Soon State */
          <motion.div
            className="podcasts-coming-soon glass"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="podcasts-coming-icon">
              <Headphones size={56} />
            </div>
            <h2 className="podcasts-coming-title">Έρχεται Σύντομα</h2>
            <p className="podcasts-coming-text">
              Νέα επεισόδια podcast ετοιμάζονται. Μείνετε συντονισμένοι!
            </p>
            <div className="podcasts-coming-dots">
              <span className="podcasts-dot" />
              <span className="podcasts-dot" />
              <span className="podcasts-dot" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Podcasts;
