import React from 'react';
import { motion } from 'framer-motion';
import releasesData from '../data/releases.json';
import releasesSettings from '../data/releases_settings.json';
import storeData from '../data/store.json';
import { Music, PlayCircle, Download, Package, Heart, CheckCircle2 } from 'lucide-react';
import './Releases.css';

const Releases = () => {
  const tracks = releasesData.tracks || [];

  return (
    <div className="releases-page container">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{releasesSettings.pageTitle || 'MUSIC CATALOG'}</h1>
        <p className="page-description">{releasesSettings.pageDescription || 'Explore the complete discography'}</p>
      </motion.div>

      <div className="releases-grid">
        {tracks.map((track, idx) => (
          <motion.div 
            key={idx}
            className="release-card glass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="release-cover-wrapper">
              <img src={track.cover} alt={track.title} />
              <div className="release-type-badge">{track.type}</div>
            </div>
            
            <div className="release-info">
              <h2>{track.title}</h2>
              <span className="release-genre">{track.genre}</span>
              
              <div className="release-actions">
                {track.streamUrl && (
                  <a href={track.streamUrl} target="_blank" rel="noreferrer" className="action-btn">
                    <Music size={18} /> Stream
                  </a>
                )}
                {track.youtubeUrl && (
                  <a href={track.youtubeUrl} target="_blank" rel="noreferrer" className="action-btn">
                    <PlayCircle size={18} /> YouTube
                  </a>
                )}
                {track.bundleUrl && (
                  <a href={track.bundleUrl} target="_blank" rel="noreferrer" className="action-btn">
                    <Package size={18} /> Bundle
                  </a>
                )}
                {track.downloadUrl && (
                  <a href={track.downloadUrl} target="_blank" rel="noreferrer" className="action-btn">
                    <Download size={18} /> Free DL
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Extras: Support & Track Bundles */}
      <div className="releases-extras">
        <motion.div 
          className="releases-support-card glass"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="support-icon-wrapper">
            <Heart className="heart-icon animate-pulse" size={36} color="#ff1493" fill="#ff1493" />
          </div>
          <h2>{releasesSettings.supportTitle}</h2>
          <p className="support-desc">{releasesSettings.supportText}</p>
          
          <div className="get-info-box">
            <h3>{releasesSettings.getTitle}</h3>
            <p>{releasesSettings.getText}</p>
          </div>
        </motion.div>

        <motion.div 
          className="releases-bundle-card glass"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>{storeData.sectionTitle}</h2>
          <p className="bundle-subtitle">{storeData.subtitle}</p>
          
          <ul className="releases-bundle-list">
            {storeData.bundleItems.map((item, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <CheckCircle2 color="#bc74f5" size={18} />
                <span>{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Releases;
