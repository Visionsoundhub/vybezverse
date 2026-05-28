import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';
import Home from './pages/Home';
import BeatStore from './pages/BeatStore';
import Releases from './pages/Releases';
import Store from './pages/Store';
import Gallery from './pages/Gallery';
import Bio from './pages/Bio';
import Links from './pages/Links';
import Podcasts from './pages/Podcasts';
import Press from './pages/Press';
import ChatbotWidget from './components/ChatbotWidget';
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
            <Route path="/releases" element={<Releases />} />
            <Route path="/store" element={<Store />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/bio" element={<Bio />} />
            <Route path="/links" element={<Links />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/press" element={<Press />} />
          </Routes>
        </main>
        <AudioPlayer />
        <ChatbotWidget />
      </Router>
    </AudioProvider>
  );
}

export default App;
