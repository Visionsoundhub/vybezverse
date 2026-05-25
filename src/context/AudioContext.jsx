import React, { createContext, useState, useRef, useEffect } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioSrc;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  const playTrack = (track) => {
    if (currentTrack && currentTrack.audioSrc === track.audioSrc) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, togglePlay, playTrack }}>
      {children}
    </AudioContext.Provider>
  );
};
