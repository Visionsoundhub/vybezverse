import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Mic2, ArrowRight, Mail, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import homeData from '../data/home.json';
import releasesData from '../data/releases.json';
import VisualizerCanvas from '../components/VisualizerCanvas';
import './Home.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState('beats_and_songs');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const containerRef = useRef(null);

  useGSAP(() => {
    // --- 1. HERO ENTRANCE ANIMATIONS ---
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.from('.hero-name-left', { x: -120, opacity: 0, duration: 1 })
      .from('.hero-name-right', { x: 120, opacity: 0, duration: 1 }, '-=0.8')
      .from('.hero-x', { scale: 0, rotation: -180, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.6')
      .from('.hero-desc', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-buttons', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4');

    // --- 2. SCROLL TRIGGER PARALLAX FOR HERO ---
    gsap.to('.hero-name-left', {
      x: -160,
      opacity: 0.1,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    gsap.to('.hero-name-right', {
      x: 160,
      opacity: 0.1,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    gsap.to('.hero-x', {
      rotation: 360,
      scale: 0.4,
      opacity: 0.1,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    gsap.to('.hero-desc, .hero-buttons', {
      y: 60,
      opacity: 0,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '40% top',
        scrub: true,
      }
    });

    // --- 3. LATEST DROP SCROLL TRIGGER ---
    gsap.from('.featured-card', {
      y: 80,
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.featured-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });

    // --- 4. NEWSLETTER SCROLL TRIGGER (STAGGERED) ---
    gsap.from('.newsletter-text h2, .newsletter-text p, .newsletter-form-wrap form > *', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.newsletter-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
  }, { scope: containerRef });

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
        body: JSON.stringify({ email, preference }),
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
    <div className="home-page" ref={containerRef}>
      
      {/* HERO SECTION - Dual Identity */}
      <section className="hero-section">
        <VisualizerCanvas />
        <div className="hero-bg-glow"></div>
        <div className="container hero-content">
          <div className="hero-text">
            
            {/* THE BIG ANIMATED TITLE */}
            <div className="hero-title-block">
              <h1 className="hero-name hero-name-left">
                {homeData.heroLine1 || 'BLACK VYBEZ'}
              </h1>
              
              <span className="hero-x">
                ×
              </span>
              
              <h1 className="hero-name hero-name-right">
                {homeData.heroLine2 || 'VYBEZMADETHIS'}
              </h1>
            </div>

            <p className="hero-desc">
              {homeData.heroDesc || 'Δεν φτιάχνω απλά beats, δημιουργώ κόσμους.'}
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
          
          <div className="featured-card glass">
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
          </div>
        </section>
      )}

      {/* NEWSLETTER / EMAIL CAPTURE */}
      <section className="newsletter-section">
        <div className="newsletter-bg"></div>
        <div className="container newsletter-content glass">
          <div className="newsletter-text">
            <h2><Sparkles color="#bc74f5" /> {homeData.newsletterTitle || 'JOIN THE VYBEZ FAMILY'}</h2>
            <p>{homeData.newsletterText || 'Γράψου στο VIP Newsletter μου.'}</p>
          </div>
          
          <div className="newsletter-form-wrap">
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
                <div className="preferences-group" style={{ textAlign: 'left', marginTop: '15px', marginBottom: '15px', color: '#ccc', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="home_pref" value="beats_and_songs" checked={preference === 'beats_and_songs'} onChange={(e) => setPreference(e.target.value)} /> Θέλω Beats και να ενημερώνομαι για κυκλοφορίες
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="home_pref" value="only_beats" checked={preference === 'only_beats'} onChange={(e) => setPreference(e.target.value)} /> Μόνο Beats
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="home_pref" value="only_songs" checked={preference === 'only_songs'} onChange={(e) => setPreference(e.target.value)} /> Μόνο Νέες Κυκλοφορίες και Νέα
                  </label>
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
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
