import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { User, Menu } from 'lucide-react';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';
import AudioPlayer from './components/AudioPlayer';
import LicenseModal from './components/LicenseModal';
import ChatbotWidget from './components/ChatbotWidget';

import Home from './pages/Home';
import Beats from './pages/Beats';
import Store from './pages/Store';
import Gallery from './pages/Gallery';
import Podcasts from './pages/Podcasts';
import Press from './pages/Press';
import Account from './pages/Account';
import Bio from './pages/Bio';
import Links from './pages/Links';
import Releases from './pages/Releases';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLinksPage = location.pathname === '/links';

  return (
    <div className="app-container">
      {/* Sticky Navbar */}
      {!isLinksPage && (
        <nav className="navbar">
          <div className="nav-content container">
            <Link to="/" className="logo">BLACK VYBEZ</Link>
            <div className="nav-links">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>HOME</Link>
              <Link to="/releases" className={location.pathname === '/releases' ? 'active' : ''}>RELEASES</Link>
              <Link to="/beats" className={location.pathname === '/beats' ? 'active' : ''}>BEATS</Link>
              <Link to="/store" className={location.pathname === '/store' ? 'active' : ''}>STORE</Link>
              <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>GALLERY</Link>
              <Link to="/podcasts" className={location.pathname === '/podcasts' ? 'active' : ''}>PODCASTS</Link>
              <Link to="/press" className={location.pathname === '/press' ? 'active' : ''}>PRESS</Link>
              <Link to="/bio" className={location.pathname === '/bio' ? 'active' : ''}>BIO</Link>
            </div>
            <div className="nav-actions">
              <Link to="/account" className="account-link"><User size={18} /> ACCOUNT</Link>
            </div>
          </div>
        </nav>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/beats" element={<Beats />} />
          <Route path="/store" element={<Store />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/press" element={<Press />} />
          <Route path="/account" element={<Account />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/links" element={<Links />} />
          <Route path="/releases" element={<Releases />} />
        </Routes>
      </main>

      <AudioPlayer />
      <LicenseModal />
      <ChatbotWidget />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <AppContent />
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
