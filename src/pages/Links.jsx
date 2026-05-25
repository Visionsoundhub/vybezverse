import { motion } from 'framer-motion';
import { ShoppingBag, Play, Music, ExternalLink, Globe, PlayCircle } from 'lucide-react';
import linksData from '../data/links.json';
import './Links.css';

const iconMap = {
  ShoppingBag: <ShoppingBag size={18} />,
  Play: <Play size={18} />,
  Music: <Music size={18} />,
  ExternalLink: <ExternalLink size={18} />,
  Globe: <Globe size={18} />,
};

function Links() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="links-page">
      <div className="links-glow links-glow-1" />
      <div className="links-glow links-glow-2" />

      <motion.div
        className="links-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile */}
        <motion.div className="links-profile" variants={itemVariants}>
          <div className="links-avatar-ring">
            <img
              src={linksData.profileImage}
              alt={linksData.profileName}
              className="links-avatar"
            />
          </div>
          <h1 className="links-name">{linksData.profileName}</h1>
          {linksData.tagline && (
            <p className="links-tagline">{linksData.tagline}</p>
          )}
        </motion.div>

        {/* Latest Release */}
        {linksData.showLatest && (
          <motion.div className="links-latest glass" variants={itemVariants}>
            <img
              src={linksData.releaseCover}
              alt={linksData.latestTitle}
              className="links-release-cover"
            />
            <p className="links-release-title">{linksData.latestTitle}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="links-actions">
          {linksData.buyLink && (
            <motion.a
              href={linksData.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="links-btn links-btn-highlight glass"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ShoppingBag size={18} />
              <span>Αγορά Bundle</span>
            </motion.a>
          )}

          {linksData.videoLink && (
            <motion.a
              href={linksData.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="links-btn glass"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Play size={18} />
              <span>Δες το Βίντεο</span>
            </motion.a>
          )}

          {linksData.appleLink && (
            <motion.a
              href={linksData.appleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="links-btn glass"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Music size={18} />
              <span>Apple Music</span>
            </motion.a>
          )}

          {linksData.streamLink && (
            <motion.a
              href={linksData.streamLink}
              target="_blank"
              rel="noopener noreferrer"
              className="links-btn glass"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ExternalLink size={18} />
              <span>Stream</span>
            </motion.a>
          )}
        </div>

        {/* Custom Buttons */}
        {linksData.buttons && linksData.buttons.length > 0 && (
          <div className="links-custom-buttons">
            {linksData.buttons.map((btn, index) => (
              <motion.a
                key={index}
                href={btn.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`links-btn glass ${btn.highlight ? 'links-btn-highlight' : ''}`}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {btn.icon && iconMap[btn.icon] ? iconMap[btn.icon] : <ExternalLink size={18} />}
                <span>{btn.text}</span>
              </motion.a>
            ))}
          </div>
        )}

        {/* Social Icons */}
        <motion.div className="links-socials" variants={itemVariants}>
          {linksData.instagram && (
            <a
              href={linksData.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="links-social-icon"
              aria-label="Instagram"
            >
              <Globe size={22} />
            </a>
          )}
          {linksData.tiktok && (
            <a
              href={linksData.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="links-social-icon"
              aria-label="TikTok"
            >
              <span className="links-tiktok-icon">TT</span>
            </a>
          )}
          {linksData.youtube && (
            <a
              href={linksData.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="links-social-icon"
              aria-label="YouTube"
            >
              <PlayCircle size={22} />
            </a>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p className="links-footer" variants={itemVariants}>
          VybezVerse
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Links;
