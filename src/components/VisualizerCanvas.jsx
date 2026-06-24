import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VisualizerCanvas = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // --- 1. SETUP THREE.JS SCENE & CAMERA ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Add dark purple atmosphere fog
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 220;
    camera.position.y = 70;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0a0c, 0); // Transparent background to layer over dark background
    containerRef.current.appendChild(renderer.domElement);

    // --- 2. CREATE GLOWING CIRCLE TEXTURE (NATIVE CANVAS) ---
    const createCircleTexture = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Glowing radial gradient
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 20, 147, 0.8)'); // Neon Pink glow
      grad.addColorStop(0.5, 'rgba(188, 116, 245, 0.3)'); // Neon Purple outer
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const particleTexture = createCircleTexture();

    // --- 3. GENERATE WAVE GRID GEOMETRY ---
    const numParticles = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const initialY = new Float32Array(numParticles);

    const color1 = new THREE.Color('#ff1493'); // Hot Pink
    const color2 = new THREE.Color('#bc74f5'); // Light Purple

    // Arrange particles in a grid
    const cols = 50;
    const rows = 40;
    const spacing = 12;
    const xOffset = (cols * spacing) / 2;
    const zOffset = (rows * spacing) / 2;

    let index = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (index >= numParticles) break;

        const x = i * spacing - xOffset;
        const z = j * spacing - zOffset;
        const y = 0; // Set via sine wave in animate loop

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        // Gradient color based on grid position
        const mixRatio = i / cols;
        const mixedColor = new THREE.Color().copy(color1).lerp(color2, mixRatio);
        colors[index * 3] = mixedColor.r;
        colors[index * 3 + 1] = mixedColor.g;
        colors[index * 3 + 2] = mixedColor.b;

        // Save grid positions for animation
        initialY[index] = index; 

        index++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // --- 4. MATERIAL & POINTS CREATION ---
    const material = new THREE.PointsMaterial({
      size: 6,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- 5. INTERACTIVE MOUSE HANDLERS ---
    const handleMouseMove = (event) => {
      // Normalize mouse between -1 and 1
      mouseRef.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // --- 6. ANIMATION LOOP ---
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const posAttr = geometry.attributes.position;

      // Update particle wave coordinates
      for (let i = 0; i < numParticles; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);

        // Dynamic double sine wave pattern
        const y = Math.sin(x * 0.015 + elapsedTime * 1.2) * 15 + 
                  Math.cos(z * 0.02 + elapsedTime * 1.5) * 15;
        
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Smoothly interpolate (lerp) mouse positions to tilt camera
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Tilt particles group slightly based on mouse
      particles.rotation.y = mouse.x * 0.25;
      particles.rotation.x = -mouse.y * 0.15 + 0.2; // slight static tilt down plus mouse reactive tilt

      renderer.render(scene, camera);
    };

    animate();

    // --- 7. HANDLE WINDOW RESIZE ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- 8. CLEANUP AND DISPOSE ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Memory cleanup
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none', // Allow clicking through to buttons
        opacity: 0.8,
      }}
    />
  );
};

export default VisualizerCanvas;
