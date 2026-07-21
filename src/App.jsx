import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { User, Menu } from 'lucide-react';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';
import AudioPlayer from './components/AudioPlayer';
import LicenseModal from './components/LicenseModal';
import ChatbotWidget from './components/ChatbotWidget';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ReleasePost from './pages/ReleasePost';
import PodcastPost from './pages/PodcastPost';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLinksPage = location.pathname === '/links';

  return (
    <div className="app-container">
      {/* Sticky Navbar */}
      {!isLinksPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/beats" element={<Beats />} />
          <Route path="/store" element={<Store />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/podcasts/:slug" element={<PodcastPost />} />
          <Route path="/press" element={<Press />} />
          <Route path="/account" element={<Account />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/links" element={<Links />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/releases/:slug" element={<ReleasePost />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </main>

      {!isLinksPage && <Footer />}

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
