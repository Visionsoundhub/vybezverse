import React, { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, FileMusic, Music4, Layers, Crown, Mail } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { LICENSE_TIERS } from '../data/licenseTiers';
import './LicenseModal.css';

const CONTACT_EMAIL = 'studiovisionsound@gmail.com';

const mailto = (track, tierLabel, extra) => {
  const subject = `${tierLabel} request: ${track.title}`;
  const body = `Hi Black Vybez,\n\nI'd like to get the ${tierLabel} for your beat "${track.title}".${extra ? `\n\n${extra}` : ''}\n\nThanks!`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

function LicenseModal() {
  const { isLicenseModalOpen, licenseModalTrack, closeLicenseModal } = useContext(AudioContext);
  const { requireLogin } = useAuth();

  if (!isLicenseModalOpen || !licenseModalTrack) return null;

  const track = licenseModalTrack;

  const handleCheckout = (url) => {
    if (!url || url === '#') return;
    if (requireLogin()) {
      window.open(url, '_blank');
      closeLicenseModal();
    }
  };

  const handleContact = (link) => {
    window.location.href = link;
    closeLicenseModal();
  };

  const icons = { mp3: Music4, wav: FileMusic, stems: Layers, exclusive: Crown };
  const tiers = LICENSE_TIERS.map((t) => ({ ...t, icon: icons[t.key] }));

  return (
    <AnimatePresence>
      <div className="license-modal-overlay" onClick={closeLicenseModal}>
        <motion.div
          className="license-modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.96, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 30 }}
          transition={{ duration: 0.22 }}
        >
          <button className="license-modal-close" onClick={closeLicenseModal} aria-label="Κλείσιμο">
            <X size={20} />
          </button>

          <div className="license-modal-header">
            <span className="license-eyebrow">Licensing options</span>
            <h2 className="license-track-title">{track.title}</h2>
          </div>

          <div className="license-grid">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div key={tier.key} className={`license-card${tier.featured ? ' license-card--featured' : ''}`}>
                  {tier.featured && <span className="license-badge">Best value</span>}
                  <div className="license-card-icon"><Icon size={26} /></div>
                  <h3>{tier.name}</h3>
                  <div className="license-price">{tier.price}</div>
                  <ul className="license-features">
                    {tier.features.map((f) => (
                      <li key={f}><Check size={15} /><span>{f}</span></li>
                    ))}
                  </ul>
                  {tier.action === 'checkout' ? (
                    <button className="btn-primary license-buy" onClick={() => handleCheckout(track.checkoutUrl || track.bundleUrl)}>
                      Αγόρασε
                    </button>
                  ) : (
                    <button className="btn-outline license-buy" onClick={() => handleContact(mailto(track, tier.name, tier.contactExtra))}>
                      <Mail size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
                      Ζήτησέ το
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="license-modal-footer">
            <p>Οι αγορές MP3/WAV γίνονται μέσω Lemon Squeezy. Τα Stems και το Exclusive Use κανονίζονται κατόπιν email, μη-αποκλειστικά αν δεν αναφέρεται ρητά διαφορετικά. Για ειδικές συμφωνίες, γράψε στο <a href={`mailto:${CONTACT_EMAIL}`} className="license-footer-link">{CONTACT_EMAIL}</a>.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LicenseModal;
