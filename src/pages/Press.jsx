import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Calendar, ArrowUpRight } from 'lucide-react';
import pressData from '../data/press.json';
import './Press.css';

function Press() {
  const articles = pressData.articles || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="press-page">
      <div className="press-glow press-glow-1" />
      <div className="press-glow press-glow-2" />

      <div className="press-container">
        {/* Header */}
        <motion.div
          className="press-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="press-header-icon">
            <Newspaper size={32} />
          </div>
          <h1 className="press-title">Τύπος & Media</h1>
          <p className="press-subtitle">Αναφορές, συνεντεύξεις & δημοσιεύσεις</p>
          <div className="press-title-line" />
        </motion.div>

        {articles.length > 0 ? (
          <motion.div
            className="press-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {articles.map((article, index) => (
              <motion.article
                key={index}
                className="press-card glass"
                variants={itemVariants}
                whileHover={{ y: -6 }}
              >
                {/* Image */}
                <div className="press-card-image-wrapper">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="press-card-image"
                  />
                  <div className="press-card-image-overlay" />
                  {article.source && (
                    <span className="press-card-source-badge">{article.source}</span>
                  )}
                </div>

                {/* Content */}
                <div className="press-card-content">
                  <div className="press-card-meta">
                    <span className="press-card-date">
                      <Calendar size={13} />
                      {article.date}
                    </span>
                  </div>

                  <h3 className="press-card-title">{article.title}</h3>

                  {article.summary && (
                    <p className="press-card-summary">{article.summary}</p>
                  )}

                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press-card-link"
                  >
                    <span>Διαβάστε Περισσότερα</span>
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="press-empty glass"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Newspaper size={48} />
            <h2>Δεν υπάρχουν ακόμα δημοσιεύσεις</h2>
            <p>Νέα άρθρα και αναφορές θα εμφανιστούν εδώ σύντομα.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Press;
