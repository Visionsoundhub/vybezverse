import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomCursor = () => {
  const [trail, setTrail] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      const newPos = { x: e.clientX, y: e.clientY, id: Date.now() };
      setTrail((prev) => {
        // Keep the last 15 positions for a smooth trail
        const newTrail = [...prev, newPos];
        if (newTrail.length > 15) return newTrail.slice(newTrail.length - 15);
        return newTrail;
      });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('card-header') ||
        target.classList.contains('mockup-cover-wrap') ||
        target.classList.contains('license-card');
      
      setIsHovering(!!isInteractable);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    // Clean up old trail elements when mouse is not moving
    const cleanupInterval = setInterval(() => {
      setTrail((prev) => (prev.length > 0 ? prev.slice(1) : []));
    }, 20);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      clearInterval(cleanupInterval);
    };
  }, []);

  if (isHovering) return null;

  return (
    <>
      {trail.map((pos, index) => {
        // Opacity and size decrease for older trail elements
        const ratio = index / trail.length;
        return (
          <motion.div
            key={pos.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              x: pos.x - 10,
              y: pos.y - 10,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#bc74f5',
              boxShadow: `0 0 ${10 * ratio}px ${5 * ratio}px rgba(188, 116, 245, ${ratio * 0.5})`,
              pointerEvents: 'none',
              zIndex: 9999,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </>
  );
};

export default CustomCursor;
