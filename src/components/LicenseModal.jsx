import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, FileMusic, Music4, Disc3, Mail } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import './LicenseModal.css';

const LicenseModal = () => {
  const { isLicenseModalOpen, licenseModalTrack, closeLicenseModal } = useContext(AudioContext);

  if (!isLicenseModalOpen || !licenseModalTrack) return null;

  const track = licenseModalTrack;
  const basePrice = track.price || "29.99€";
  
  // Calculate relative prices (strip € sign if needed and re-add)
  const parsePrice = (priceStr) => {
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 29.99 : num;
  };

  const mp3Price = parsePrice(basePrice);
  const wavPrice = (mp3Price + 20.00).toFixed(2) + "€";
  const stemsPrice = (mp3Price + 120.00).toFixed(2) + "€";

  // Contact email for exclusive/stems requests
  const contactEmail = "studiovisionsound@gmail.com";
  const mailtoLink = `mailto:${contactEmail}?subject=Exclusive Stems Request: ${encodeURIComponent(track.title)}&body=Hi Black Vybez, I am interested in purchasing the Exclusive Stems / Trackouts license for your beat "${encodeURIComponent(track.title)}". Please let me know the details.`;

  return (
    <AnimatePresence>
      <div className="license-modal-overlay" onClick={closeLicenseModal}>
        <motion.div 
          className="license-modal-content glass"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Close button */}
          <button className="license-modal-close" onClick={closeLicenseModal}>
            <X size={24} />
          </button>

          {/* Header */}
          <div className="license-modal-header">
            <span className="subtitle-tag">LICENSING OPTIONS</span>
            <h2>Choose a License for</h2>
            <h3 className="track-title-highlight">{track.title}</h3>
          </div>

          {/* Grid of options */}
          <div className="license-grid">
            
            {/* Tier 1: MP3 Lease */}
            <div className="license-card glass-card">
              <div className="card-badge">POPULAR</div>
              <div className="card-icon-wrap">
                <Music4 size={32} color="#bc74f5" />
              </div>
              <h4>MP3 LEASE</h4>
              <div className="card-price">{basePrice}</div>
              
              <ul className="license-features">
                <li><Check size={16} color="#bc74f5" /> <span>Untagged MP3 File</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>Up to 100,000 Streams</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>Non-Exclusive Rights</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>1 Music Video Limit</span></li>
              </ul>

              <a 
                href={track.checkoutUrl || track.bundleUrl || "#"} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-card-buy mp3-btn"
              >
                BUY MP3 LEASE
              </a>
            </div>

            {/* Tier 2: WAV Lease */}
            <div className="license-card glass-card featured-license-card">
              <div className="card-badge badge-gradient">BEST VALUE</div>
              <div className="card-icon-wrap">
                <FileMusic size={32} color="#ff1493" />
              </div>
              <h4>WAV LEASE</h4>
              <div className="card-price">{wavPrice}</div>
              
              <ul className="license-features">
                <li><Check size={16} color="#ff1493" /> <span>Untagged WAV + MP3</span></li>
                <li><Check size={16} color="#ff1493" /> <span>Up to 500,000 Streams</span></li>
                <li><Check size={16} color="#ff1493" /> <span>Non-Exclusive Rights</span></li>
                <li><Check size={16} color="#ff1493" /> <span>Unlimited Music Videos</span></li>
                <li><Check size={16} color="#ff1493" /> <span>Radio Broadcasting Rights</span></li>
              </ul>

              <a 
                href={track.checkoutUrl || track.bundleUrl || "#"} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-card-buy wav-btn"
              >
                BUY WAV LEASE
              </a>
            </div>

            {/* Tier 3: Exclusive Stems */}
            <div className="license-card glass-card">
              <div className="card-icon-wrap">
                <Disc3 size={32} color="#bc74f5" />
              </div>
              <h4>EXCLUSIVE STEMS</h4>
              <div className="card-price">{stemsPrice}</div>
              
              <ul className="license-features">
                <li><Check size={16} color="#bc74f5" /> <span>WAV + MP3 + Trackout Stems</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>Unlimited Streams & Sales</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>Exclusive Commercial Rights</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>Beat removed from store</span></li>
              </ul>

              <a 
                href={mailtoLink} 
                className="btn-card-buy stems-btn"
              >
                <Mail size={16} style={{ marginRight: '6px' }} /> REQUEST STEMS
              </a>
            </div>

          </div>

          {/* Footer warning info */}
          <div className="license-modal-footer">
            <p>All purchases are secured via Payhip. Standard leases are non-exclusive unless purchasing the Exclusive license. For custom contracts or inquiries, contact <a href={`mailto:${contactEmail}`} className="footer-email-link">{contactEmail}</a>.</p>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LicenseModal;
