import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';
import Home from './pages/Home';
import BeatStore from './pages/BeatStore';
import './App.css';

function App() {
  return (
    <AudioProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/beats" element={<BeatStore />} />
            <Route path="/releases" element={<div className="container" style={{paddingTop:'60px'}}><h1>RELEASES</h1></div>} />
            <Route path="/store" element={<div className="container" style={{paddingTop:'60px'}}><h1>STORE</h1></div>} />
            <Route path="/gallery" element={<div className="container" style={{paddingTop:'60px'}}><h1>GALLERY</h1></div>} />
          </Routes>
        </main>
        <AudioPlayer />
      </Router>
    </AudioProvider>
  );
}

export default App;
