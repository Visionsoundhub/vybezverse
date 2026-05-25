import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import homeData from '../data/home.json';
import './Home.css';

const Home = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(homeData);
  }, []);

  if (!data) return null;

  // Extract YouTube ID from link
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(data.dropVideo);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <motion.section 
        className="hero-section container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-content glass-panel">
          <div className="hero-text">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glow-text"
            >
              {data.heroTitle}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {data.heroSubtitle}
            </motion.p>
          </div>
          {data.heroImage && (
            <motion.div 
              className="hero-image-wrapper"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <img src={data.heroImage} alt="VYBEZMADETHIS" className="hero-image" />
              <div className="hero-image-glow"></div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Latest Drop Section */}
      {data.showDrop && (
        <motion.section 
          className="latest-drop-section container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-header">
            <span className="accent-dot"></span>
            <h2>LATEST DROP</h2>
          </div>
          
          <div className="drop-card glass">
            <h3>{data.dropTitle}</h3>
            
            {videoId && (
              <div className="video-wrapper">
                <iframe 
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  title="Latest Drop Video"
                ></iframe>
              </div>
            )}
            
            <div className="drop-actions">
              {data.dropStream && <a href={data.dropStream} target="_blank" rel="noreferrer" className="btn btn-outline">STREAM IT</a>}
              {data.dropBuy && <a href={data.dropBuy} target="_blank" rel="noreferrer" className="btn btn-primary">ΑΓΟΡΑΣΕ ΤΟ</a>}
              {data.dropFree && <a href={data.dropFree} target="_blank" rel="noreferrer" className="btn btn-ghost">FREE DOWNLOAD</a>}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;
