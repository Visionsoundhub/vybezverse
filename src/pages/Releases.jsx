import React from 'react';
import { motion } from 'framer-motion';
import releasesData from '../data/releases.json';
import { Music, PlayCircle, Download, Package } from 'lucide-react';
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
        <h1>LATEST RELEASES</h1>
        <p>Explore the complete discography</p>
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
    </div>
  );
};

export default Releases;
