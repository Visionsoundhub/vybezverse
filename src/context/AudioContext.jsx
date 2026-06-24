import React, { createContext, useState, useRef, useEffect } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
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

  const seek = (percent) => {
    const audio = audioRef.current;
    if (audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration;
      setProgress(percent);
      setCurrentTime(audio.currentTime);
    }
  };

  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [licenseModalTrack, setLicenseModalTrack] = useState(null);
  const [volume, setVolume] = useState(0.8);

  const openLicenseModal = (track) => {
    setLicenseModalTrack(track || currentTrack);
    setIsLicenseModalOpen(true);
  };

  const closeLicenseModal = () => {
    setIsLicenseModalOpen(false);
    setLicenseModalTrack(null);
  };

  const changeVolume = (val) => {
    setVolume(val);
    audioRef.current.volume = val;
  };

  return (
    <AudioContext.Provider value={{ 
      currentTrack, isPlaying, progress, duration, currentTime, 
      isLicenseModalOpen, licenseModalTrack, volume,
      togglePlay, playTrack, seek, openLicenseModal, closeLicenseModal, changeVolume
    }}>
      {children}
    </AudioContext.Provider>
  );
};
