import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VisualizerCanvas = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, worldX: 0, worldZ: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // --- 1. SETUP THREE.JS SCENE & CAMERA ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.008);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
    camera.position.z = 220;
    camera.position.y = 80;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0a0c, 0);
    containerRef.current.appendChild(renderer.domElement);

    // --- 2. TEXTURES ---
    const createCircleTexture = (glowColor, coreColor) => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, coreColor);
      grad.addColorStop(0.2, glowColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      return new THREE.CanvasTexture(canvas);
    };

    const waveTexture = createCircleTexture('rgba(255, 20, 147, 0.8)', 'rgba(255, 255, 255, 1)');
    const starTexture = createCircleTexture('rgba(188, 116, 245, 0.5)', 'rgba(255, 255, 255, 0.9)');

    // --- 3. WAVE GRID GEOMETRY ---
    const numWaveParticles = 3000;
    const waveGeo = new THREE.BufferGeometry();
    const wavePos = new Float32Array(numWaveParticles * 3);
    const waveColors = new Float32Array(numWaveParticles * 3);
    const waveBaseY = new Float32Array(numWaveParticles); // Store base Y for spring logic

    const color1 = new THREE.Color('#ff1493');
    const color2 = new THREE.Color('#bc74f5');

    const cols = 60;
    const rows = 50;
    const spacing = 14;
    const xOffset = (cols * spacing) / 2;
    const zOffset = (rows * spacing) / 2;

    let index = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (index >= numWaveParticles) break;

        const x = i * spacing - xOffset + (Math.random() * 4 - 2); // Slight random jitter
        const z = j * spacing - zOffset + (Math.random() * 4 - 2);
        
        wavePos[index * 3] = x;
        wavePos[index * 3 + 1] = 0;
        wavePos[index * 3 + 2] = z;
        waveBaseY[index] = 0;

        const mixRatio = i / cols;
        const mixedColor = new THREE.Color().copy(color1).lerp(color2, mixRatio);
        waveColors[index * 3] = mixedColor.r;
        waveColors[index * 3 + 1] = mixedColor.g;
        waveColors[index * 3 + 2] = mixedColor.b;

        index++;
      }
    }

    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePos, 3));
    waveGeo.setAttribute('color', new THREE.BufferAttribute(waveColors, 3));

    const waveMat = new THREE.PointsMaterial({
      size: 5,
      map: waveTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wavePoints = new THREE.Points(waveGeo, waveMat);
    scene.add(wavePoints);

    // --- 4. GALAXY STARS BACKGROUND ---
    const numStars = 1500;
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(numStars * 3);
    const starsVel = new Float32Array(numStars); // For shooting stars

    for(let i=0; i < numStars; i++) {
      starsPos[i*3] = (Math.random() - 0.5) * 2000;
      starsPos[i*3+1] = Math.random() * 1000 - 200; // Mostly above
      starsPos[i*3+2] = (Math.random() - 0.5) * 2000;
      
      // 2% chance to be a shooting star
      starsVel[i] = Math.random() > 0.98 ? (Math.random() * 2 + 1) : 0; 
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      map: starTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starPoints);

    // --- 5. INTERACTIVE MOUSE HANDLERS ---
    const handleMouseMove = (event) => {
      mouseRef.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Map mouse to world coordinates roughly for the grid interaction
      // This is a simple approximation
      mouseRef.current.worldX = mouseRef.current.targetX * (xOffset * 1.5);
      mouseRef.current.worldZ = -mouseRef.current.targetY * (zOffset * 1.5);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // --- 6. ANIMATION LOOP ---
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const posAttr = waveGeo.attributes.position;
      const mouse = mouseRef.current;

      // Smooth mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Update wave
      for (let i = 0; i < numWaveParticles; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);

        // Base sine wave
        let y = Math.sin(x * 0.02 + elapsedTime * 1.5) * 12 + 
                Math.cos(z * 0.025 + elapsedTime * 1.2) * 12;

        // Intense Mouse Interaction (Repulsion / Magnetic effect)
        const dx = x - mouse.worldX;
        const dz = z - mouse.worldZ;
        const distSq = dx*dx + dz*dz;
        const maxDist = 4000; // Radius of effect squared

        if (distSq < maxDist) {
          const force = (maxDist - distSq) / maxDist; // 0 to 1
          y += force * 45; // Pop up towards mouse
        }
        
        // Add subtle breathing
        y += Math.sin(elapsedTime * 0.5 + i) * 2;

        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Update shooting stars
      const sPosAttr = starsGeo.attributes.position;
      for(let i=0; i<numStars; i++) {
        if(starsVel[i] > 0) {
          let sx = sPosAttr.getX(i);
          let sy = sPosAttr.getY(i);
          let sz = sPosAttr.getZ(i);
          
          sx -= starsVel[i] * 3; // Move diagonally left
          sy -= starsVel[i] * 2; // Move down

          // Reset if too far
          if (sy < -500 || sx < -1000) {
             sx = 1000;
             sy = 1000;
          }
          sPosAttr.setX(i, sx);
          sPosAttr.setY(i, sy);
        }
      }
      sPosAttr.needsUpdate = true;

      // Camera tilt parallax
      camera.position.x = mouse.x * 40;
      camera.position.y = 80 + (mouse.y * 20);
      camera.lookAt(0, 0, 0);

      // Starfield slow rotation
      starPoints.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // --- 7. HANDLE RESIZE ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 8. CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      waveGeo.dispose();
      waveMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      waveTexture.dispose();
      starTexture.dispose();
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
        pointerEvents: 'none',
        opacity: 0.9, // Slightly more opaque for the stars to pop
      }}
    />
  );
};

export default VisualizerCanvas;
