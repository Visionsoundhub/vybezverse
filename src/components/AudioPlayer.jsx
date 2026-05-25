import React, { useContext, useState, useRef, useEffect } from 'react';
import { AudioContext } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import './AudioPlayer.css';

const AudioPlayer = () => {
  const { currentTrack, isPlaying, progress, togglePlay } = useContext(AudioContext);
  const [volume, setVolume] = useState(1);
  const progressRef = useRef(null);

  if (!currentTrack) return null;

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

        {/* Center: Controls & Progress */}
        <div className="player-center">
          <div className="player-controls">
            <button className="ctrl-btn"><Shuffle size={18} /></button>
            <button className="ctrl-btn"><SkipBack size={20} /></button>
            <button className="play-pause-btn" onClick={togglePlay}>
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="play-icon-offset" />}
            </button>
            <button className="ctrl-btn"><SkipForward size={20} /></button>
            <button className="ctrl-btn"><Repeat size={18} /></button>
          </div>
          
          <div className="progress-row">
            <span className="time-text">0:00</span>
            <div className="progress-bar-bg" ref={progressRef}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
                <div className="progress-thumb"></div>
              </div>
            </div>
            <span className="time-text">3:42</span> {/* Dummy duration for now */}
          </div>
        </div>

        {/* Right: Actions & Volume */}
        <div className="player-right">
          <div className="volume-control">
            <Volume2 size={18} color="#ccc" />
            <div className="volume-bar-bg">
              <div className="volume-bar-fill" style={{ width: `${volume * 100}%` }}></div>
            </div>
          </div>
          
          <div className="player-actions">
            <button className="btn-player-outline">LICENSING</button>
            <a href={currentTrack.checkoutUrl} target="_blank" rel="noreferrer" className="btn-player-solid">BUY NOW</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AudioPlayer;
