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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      // Here you would connect to your Mailchimp / Sendgrid API
    }
  };

  const featuredRelease = releasesData.tracks[0]; // Get the newest track

  return (
    <div className="home-page">
      
      {/* HERO SECTION - Dual Identity */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="container hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="glitch-text" data-text="VYBEZMADETHIS">VYBEZMADETHIS</h1>
            <h2 className="hero-subtitle">ARTIST &times; PRODUCER</h2>
            <p className="hero-desc">
              Δεν φτιάχνω απλά beats, δημιουργώ κόσμους. Από αποκλειστικές παραγωγές για artists μέχρι τα δικά μου προσωπικά tracks, καλωσήρθες στο σύμπαν μου.
            </p>
            
            <div className="hero-buttons">
              <Link to="/releases" className="btn-dual artist-btn">
                <Mic2 size={20} />
                <span>MY MUSIC</span>
              </Link>
              <Link to="/beats" className="btn-dual producer-btn">
                <Headphones size={20} />
                <span>BEATSTORE</span>
              </Link>
            </div>
          </motion.div>
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
                Το πλήρες πακέτο περιλαμβάνει High Quality MP3, οδηγίες για iPhone ringtone, και **χειρόγραφους στίχους με υπογραφή**.
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
            <h2><Sparkles color="#bc74f5" /> JOIN THE VYBEZ FAMILY</h2>
            <p>Γράψου στο VIP Newsletter μου. Μάθε πρώτος για νέες κυκλοφορίες, πάρε αποκλειστικά discounts στα beats και free υλικό.</p>
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
              </form>
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
