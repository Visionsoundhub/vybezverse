import React, { useContext, useState, useRef, useEffect } from 'react';
import { AudioContext } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import './AudioPlayer.css';

const AudioPlayer = () => {
  const { 
    currentTrack, isPlaying, progress, duration, currentTime, volume,
    togglePlay, seek, openLicenseModal, changeVolume 
  } = useContext(AudioContext);

  const canvasRef = useRef(null);
  const [hoverX, setHoverX] = useState(null);

  // Time formatter helper
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Deterministic waveform generator based on track title hash
  const generateWaveform = (title) => {
    const bars = 80;
    const wave = [];
    const str = title || "default";
    for (let i = 0; i < bars; i++) {
      const charCode = str.charCodeAt(i % str.length);
      const angle = (i / bars) * Math.PI * 3.5;
      const height = Math.abs(Math.sin(angle) * 0.65 + Math.cos(charCode + i) * 0.25 + 0.1);
      wave.push(Math.max(0.15, Math.min(1.0, height))); // keep heights between 0.15 and 1.0
    }
    return wave;
  };

  // Draw Waveform on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentTrack) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);

    const wave = generateWaveform(currentTrack.title);
    const totalBars = wave.length;
    
    // Calculate gap and bar widths dynamically based on resolution
    const barWidth = (width / totalBars) * 0.65;
    const gap = (width / totalBars) * 0.35;

    const currentPercent = progress;
    const hoverPercent = hoverX !== null ? (hoverX / canvas.offsetWidth) * 100 : null;

    for (let i = 0; i < totalBars; i++) {
      const h = wave[i] * height * 0.75; // scale height down slightly to fit canvas comfortably
      const x = i * (barWidth + gap);
      const y = (height - h) / 2;

      const barPercent = (i / totalBars) * 100;
      let fillColor = 'rgba(236, 227, 208, 0.16)'; // Default unplayed bar (warm bone dim)

      if (barPercent <= currentPercent) {
        // Played section: warm ochre -> vermilion gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, '#E0902F'); // Ochre
        grad.addColorStop(1, '#E24A26'); // Vermilion
        fillColor = grad;
      } else if (hoverPercent !== null && barPercent <= hoverPercent) {
        // Preview seek section on mouse hover
        fillColor = 'rgba(224, 144, 47, 0.45)';
      }

      ctx.fillStyle = fillColor;
      ctx.beginPath();
      // Draw rounded bars (with browser safety fallback)
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, h, 2);
      } else {
        ctx.rect(x, y, barWidth, h);
      }
      ctx.fill();
    }
  }, [currentTrack, progress, hoverX]);

  if (!currentTrack) return null;

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    seek(percent);
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  };

  const handleCanvasMouseLeave = () => {
    setHoverX(null);
  };

  return (
    <div className="player-wrapper">
      <div className="floating-player glass-pill">
        
        {/* Left: Track Info */}
        <div className="player-track-info">
          <img src={currentTrack.cover} alt="Cover" className="player-cover" />
          <div className="player-details">
            <h4 className="player-title">{currentTrack.title}</h4>
            <span className="player-artist">VybezMadeThis</span>
          </div>
        </div>

        {/* Center: Controls & Waveform Progress */}
        <div className="player-center">
          <div className="player-controls">
            <button className="ctrl-btn"><Shuffle size={16} /></button>
            <button className="ctrl-btn"><SkipBack size={18} /></button>
            <button className="play-pause-btn" onClick={togglePlay}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="play-icon-offset" />}
            </button>
            <button className="ctrl-btn"><SkipForward size={18} /></button>
            <button className="ctrl-btn"><Repeat size={16} /></button>
          </div>
          
          <div className="progress-row">
            <span className="time-text">{formatTime(currentTime)}</span>
            <div className="waveform-container">
              <canvas 
                ref={canvasRef}
                className="waveform-canvas"
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
              />
            </div>
            <span className="time-text">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Actions & Volume Slider */}
        <div className="player-right">
          <div className="volume-control">
            <Volume2 size={16} color="#ccc" />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
          
          <div className="player-actions">
            <button className="btn-player-outline" onClick={() => openLicenseModal(currentTrack)}>LICENSING</button>
            <a href={currentTrack.checkoutUrl} target="_blank" rel="noreferrer" className="btn-player-solid">BUY NOW</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AudioPlayer;
