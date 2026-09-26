import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { User, Menu } from 'lucide-react';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';
import AudioPlayer from './components/AudioPlayer';
import LicenseModal from './components/LicenseModal';
import ChatbotWidget from './components/ChatbotWidget';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import HomeV2 from './pages/HomeV2'; // η αρχική φορτώνει μαζί με το app, όχι lazy
// Lazy loaded pages for code splitting
const Beats = lazy(() => import('./pages/Beats'));
const Store = lazy(() => import('./pages/Store'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const PodcastPost = lazy(() => import('./pages/PodcastPost'));
const Press = lazy(() => import('./pages/Press'));
const Account = lazy(() => import('./pages/Account'));
const Bio = lazy(() => import('./pages/Bio'));
const Links = lazy(() => import('./pages/Links'));
const Releases = lazy(() => import('./pages/Releases'));
const ReleasePost = lazy(() => import('./pages/ReleasePost'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AliceBlogPost = lazy(() => import('./pages/AliceBlogPost'));

// Fallback loader
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
    <div className="spinner"></div> Loading...
  </div>
);

function NotFound() {
  return (
    <section style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '120px 16px 60px' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '.14em' }}>404</div>
        <h1 style={{ fontFamily: "'Commissioner', var(--font-display)", fontSize: 'clamp(2rem,6vw,3.6rem)', margin: '12px 0' }}>Αυτή η σελίδα δεν υπάρχει</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Ίσως άλλαξε θέση. Πάμε από την αρχή.</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', padding: '12px 24px', textDecoration: 'none' }}>Αρχική</Link>
      </div>
    </section>
  );
}

function AppContent() {
  const location = useLocation();
  const isLinksPage = location.pathname === '/links';

  return (
    <div className="app-container">
      {/* Sticky Navbar */}
      {!isLinksPage && <Navbar />}

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomeV2 />} />
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
            <Route path="/blogs/:slug" element={<AliceBlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
    <ErrorBoundary>
      <AuthProvider>
        <AudioProvider>
          <Router>
            <AppContent />
          </Router>
        </AudioProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
