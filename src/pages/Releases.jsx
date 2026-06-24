import React from 'react';
import { motion } from 'framer-motion';
import releasesData from '../data/releases.json';
import releasesSettings from '../data/releases_settings.json';
import storeData from '../data/store.json';
import { Music, PlayCircle, Download, Package, Heart, CheckCircle2 } from 'lucide-react';
import './Releases.css';

const Releases = () => {
  const tracks = releasesData.tracks || [];

  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState('beats_and_songs');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setErrorMessage('');
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preference, source: 'releases' }),
      });

      const data = await response.json();
      if (response.ok && (data.success || data.emailCaptured)) {
        setSubscribed(true);
        setEmail('');
      } else {
        setErrorMessage(data.error || 'Υπήρξε ένα σφάλμα. Δοκιμάστε ξανά.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setErrorMessage('Σφάλμα σύνδεσης.');
    }
  };

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

      {/* RELEASES NEWSLETTER */}
      <section className="releases-newsletter glass" style={{ padding: '40px', marginTop: '60px', borderRadius: '16px', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
        <h2>Μείνε Συντονισμένος</h2>
        <p style={{ color: '#ccc', marginBottom: '20px' }}>Γράψου στο VIP Newsletter για Νέες Κυκλοφορίες.</p>
        {subscribed ? (
          <div style={{ color: '#bc74f5', fontWeight: 'bold' }}>✓ Επιτυχής Εγγραφή!</div>
        ) : (
          <form onSubmit={handleSubscribe} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Το email σου..." value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff' }} />
            <div style={{ textAlign: 'left', fontSize: '0.9rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="rel_pref" value="beats_and_songs" checked={preference === 'beats_and_songs'} onChange={e => setPreference(e.target.value)} /> Θέλω Beats και να ενημερώνομαι για κυκλοφορίες
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="rel_pref" value="only_beats" checked={preference === 'only_beats'} onChange={e => setPreference(e.target.value)} /> Μόνο Beats
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="rel_pref" value="only_songs" checked={preference === 'only_songs'} onChange={e => setPreference(e.target.value)} /> Μόνο Νέες Κυκλοφορίες και Νέα
              </label>
            </div>
            <button type="submit" className="action-btn" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>ΕΓΓΡΑΦΗ</button>
            {errorMessage && <div style={{ color: '#ff4d4d' }}>{errorMessage}</div>}
          </form>
        )}
      </section>
    </div>
  );
};

export default Releases;
