import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Headphones, Mic2, ArrowRight, Mail, Sparkles } from 'lucide-react';
import homeData from '../data/home.json';
import releasesData from '../data/releases.json';
import './Home.css';

const Home = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setErrorMessage('');
      const response = await fetch('/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubscribed(true);
        setEmail('');
      } else {
        setErrorMessage(data.error || 'Υπήρξε ένα σφάλμα. Δοκιμάστε ξανά.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setErrorMessage('Σφάλμα σύνδεσης. Δοκιμάστε ξανά αργότερα.');
    }
  };

  const featuredRelease = releasesData.tracks[0]; // Get the newest track

  return (
    <div className="home-page">
      
      {/* HERO SECTION - Dual Identity */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--delay': `${Math.random() * 5}s`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--size': `${Math.random() * 4 + 1}px`,
            }}></div>
          ))}
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            
            {/* THE BIG ANIMATED TITLE */}
            <div className="hero-title-block">
              <motion.h1 
                className="hero-name hero-name-left"
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {homeData.heroLine1 || 'BLACK VYBEZ'}
              </motion.h1>
              
              <motion.span 
                className="hero-x"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                ×
              </motion.span>
              
              <motion.h1 
                className="hero-name hero-name-right"
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              >
                {homeData.heroLine2 || 'VYBEZMADETHIS'}
              </motion.h1>
            </div>

            <motion.p 
              className="hero-desc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {homeData.heroDesc || 'Δεν φτιάχνω απλά beats, δημιουργώ κόσμους.'}
            </motion.p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Link to="/releases" className="btn-dual artist-btn">
                <Mic2 size={20} />
                <span>MY MUSIC</span>
              </Link>
              <Link to="/beats" className="btn-dual producer-btn">
                <Headphones size={20} />
                <span>BEATSTORE</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURED RELEASE SECTION */}
      {featuredRelease && (
        <section className="featured-section container">
          <div className="section-title-wrap">
            <h2 className="section-title">LATEST DROP</h2>
            <div className="title-line"></div>
          </div>
          
          <motion.div 
            className="featured-card glass"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="featured-cover">
              <img src={featuredRelease.cover} alt={featuredRelease.title} />
              <div className="featured-badge">NEW</div>
            </div>
            <div className="featured-info">
              <h3>{featuredRelease.title}</h3>
              <p className="featured-genre">{featuredRelease.genre} | {featuredRelease.type}</p>
              <p className="featured-desc">
                {homeData.featuredDesc || 'Το πλήρες πακέτο περιλαμβάνει High Quality MP3, οδηγίες για iPhone ringtone, και χειρόγραφους στίχους με υπογραφή.'}
              </p>
              
              <div className="featured-actions">
                <a href={featuredRelease.streamUrl} target="_blank" rel="noreferrer" className="btn-outline">
                  STREAM NOW
                </a>
                <Link to="/store" className="btn-solid">
                  VIEW BUNDLE
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* NEWSLETTER / EMAIL CAPTURE */}
      <section className="newsletter-section">
        <div className="newsletter-bg"></div>
        <div className="container newsletter-content glass">
          <motion.div 
            className="newsletter-text"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2><Sparkles color="#bc74f5" /> {homeData.newsletterTitle || 'JOIN THE VYBEZ FAMILY'}</h2>
            <p>{homeData.newsletterText || 'Γράψου στο VIP Newsletter μου.'}</p>
          </motion.div>
          
          <motion.div 
            className="newsletter-form-wrap"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {subscribed ? (
              <div className="success-message">
                <span className="success-icon">✓</span>
                Καλωσήρθες στην παρέα! Check the email.
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <div className="input-group">
                  <Mail size={20} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-subscribe">
                  SUBSCRIBE <ArrowRight size={18} />
                </button>
                {errorMessage && (
                  <div className="error-message" style={{ color: '#ff4d4d', marginTop: '12px', fontSize: '14px', width: '100%', textAlign: 'center', fontWeight: '500' }}>
                    {errorMessage}
                  </div>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
