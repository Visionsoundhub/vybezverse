import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      // Hide cursor if hovering over buttons, links, inputs, or interactive elements
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

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="custom-cursor"
      animate={{
        x: mousePosition.x - 15,
        y: mousePosition.y - 15,
        opacity: isHovering ? 0 : 1,
        scale: isHovering ? 0 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300,
        mass: 0.5,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#bc74f5',
        boxShadow: '0 0 20px 10px rgba(188, 116, 245, 0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default CustomCursor;
