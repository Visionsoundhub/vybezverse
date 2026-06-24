import React, { useEffect, useRef } from 'react';

const GalaxyBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Stars
    const stars = [];
    const numStars = 100; // Fewer stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        alpha: Math.random() * 0.2, // Very low max alpha
        speed: Math.random() * 0.01 + 0.002, // Slower twinkle
      });
    }

    // Shooting stars
    const shootingStars = [];
    
    const draw = () => {
      // Clear with slight trail effect
      ctx.fillStyle = 'rgba(10, 10, 12, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw normal stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        // Twinkle
        star.alpha += star.speed;
        if (star.alpha > 0.2 || star.alpha < 0) { // Limit max opacity to 0.2
          star.speed = -star.speed;
        }
      });

      // Spawn shooting stars randomly - less frequent
      if (Math.random() < 0.003) {
        shootingStars.push({
          x: Math.random() * width,
          y: 0,
          length: Math.random() * 50 + 20,
          speed: Math.random() * 5 + 3, // Slower shooting stars
          angle: Math.PI / 4, // 45 degrees
          opacity: 0.2 // Very low opacity for shooting stars
        });
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length * Math.cos(s.angle), s.y - s.length * Math.sin(s.angle));
        ctx.strokeStyle = `rgba(188, 116, 245, ${s.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        s.opacity -= 0.005;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1, // Keep it behind everything
      }}
    />
  );
};

export default GalaxyBackground;
