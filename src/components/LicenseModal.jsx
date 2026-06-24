import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, FileMusic, Music4, Disc3, Mail } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import './LicenseModal.css';

const LicenseModal = () => {
  const { isLicenseModalOpen, licenseModalTrack, closeLicenseModal } = useContext(AudioContext);
  const { requireLogin, currentUser } = useAuth();

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

  const handleCheckout = (url, licenseType) => {
    if (!url || url === "#") return;
    if (requireLogin()) {
      // Open Payhip checkout immediately without generating a client-side PDF
      window.open(url, '_blank');
      
      // Close the modal
      closeLicenseModal();
    }
  };

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
            
            {/* Tier 1: Showcase License */}
            <div className="license-card glass-card">
              <div className="card-icon-wrap">
                <Music4 size={32} color="#4fa8ff" />
              </div>
              <h4>SHOWCASE LICENSE (MP3)</h4>
              <div className="card-price">$14.99</div>
              
              <ul className="license-features">
                <li><Check size={16} color="#4fa8ff" /> <span>Used for Music Recording</span></li>
                <li><Check size={16} color="#4fa8ff" /> <span>Distribute up to 1,500 copies</span></li>
                <li><Check size={16} color="#4fa8ff" /> <span>0 Online Audio Streams</span></li>
                <li><Check size={16} color="#4fa8ff" /> <span>0 Music Video</span></li>
                <li><Check size={16} color="#4fa8ff" /> <span>UNLIMITED Non-profit Live Performances</span></li>
              </ul>

              <button 
                onClick={() => handleCheckout(track.checkoutUrl || track.bundleUrl, 'SHOWCASE LICENSE (MP3)')} 
                className="btn-card-buy mp3-btn"
                style={{ background: 'rgba(79, 168, 255, 0.1)', borderColor: '#4fa8ff', color: '#4fa8ff' }}
              >
                ADD TO CART
              </button>
            </div>

            {/* Tier 2: Premium License */}
            <div className="license-card glass-card featured-license-card">
              <div className="card-badge badge-gradient">BEST VALUE</div>
              <div className="card-icon-wrap">
                <FileMusic size={32} color="#ff1493" />
              </div>
              <h4>PREMIUM LICENSE (MP3+WAV)</h4>
              <div className="card-price">$39.99</div>
              
              <ul className="license-features">
                <li><Check size={16} color="#ff1493" /> <span>Used for Music Recording</span></li>
                <li><Check size={16} color="#ff1493" /> <span>Distribute up to 3,000 copies</span></li>
                <li><Check size={16} color="#ff1493" /> <span>700,000 Online Audio Streams</span></li>
                <li><Check size={16} color="#ff1493" /> <span>1 Music Video</span></li>
                <li><Check size={16} color="#ff1493" /> <span>For Profit Live Performances</span></li>
                <li><Check size={16} color="#ff1493" /> <span>Radio Broadcasting (2 Stations)</span></li>
              </ul>

              <button 
                onClick={() => handleCheckout(track.checkoutUrl || track.bundleUrl, 'PREMIUM LICENSE (MP3+WAV)')} 
                className="btn-card-buy wav-btn"
              >
                ADD TO CART
              </button>
            </div>

            {/* Tier 3: Unlimited License */}
            <div className="license-card glass-card">
              <div className="card-icon-wrap">
                <Disc3 size={32} color="#bc74f5" />
              </div>
              <h4>UNLIMITED LICENSE (TRACKOUTS)</h4>
              <div className="card-price">$99.99</div>
              
              <ul className="license-features">
                <li><Check size={16} color="#bc74f5" /> <span>Used for Music Recording</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>UNLIMITED Distribution copies</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>UNLIMITED Online Audio Streams</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>UNLIMITED Music Videos</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>For Profit Live Performances</span></li>
                <li><Check size={16} color="#bc74f5" /> <span>Radio Broadcasting (UNLIMITED)</span></li>
              </ul>

              <button 
                onClick={() => handleCheckout(track.checkoutUrl || track.bundleUrl, 'UNLIMITED LICENSE (TRACKOUTS)')} 
                className="btn-card-buy stems-btn"
              >
                ADD TO CART
              </button>
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
