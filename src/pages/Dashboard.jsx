import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Ticket, Music, AlertCircle, ShoppingBag, FileText, X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [discountCode, setDiscountCode] = useState(null);

  // Auth form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch user data from firestore
    const fetchDashboardData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const discountDoc = await getDoc(doc(db, 'global_settings', 'discounts'));
        if (discountDoc.exists() && discountDoc.data().activeCode) {
          setDiscountCode(discountDoc.data().activeCode);
        } else {
          setDiscountCode('VYBEZ2026'); // Default if not found
        }
      } catch (e) {
        console.error("Error fetching dashboard data", e);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err) {
      console.error(err);
      setError('Υπήρξε ένα πρόβλημα. Προσπάθησε ξανά.');
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError('Το Google Login απέτυχε. Προσπάθησε ξανά.');
    }
    setLoading(false);
  };

  // Categorize purchases
  const beats = userData?.purchases?.filter(p => p.licenseType?.toLowerCase().includes('lease') || p.licenseType?.toLowerCase().includes('exclusive')) || [];
  const songs = userData?.purchases?.filter(p => !p.licenseType?.toLowerCase().includes('lease') && !p.licenseType?.toLowerCase().includes('exclusive') && p.licenseType) || [];

  if (!currentUser) {
    return (
      <div className="dashboard-page page-container container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="auth-box glass" style={{ maxWidth: '400px', width: '100%', padding: '2rem', borderRadius: '20px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{isLogin ? 'WELCOME BACK' : 'JOIN VYBEZ FAMILY'}</h2>
          <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {isLogin ? 'Συνδέσου στο λογαριασμό σου.' : 'Δημιούργησε λογαριασμό για να έχεις τα beats σου σε ένα μέρος.'}
          </p>

          {error && <div className="auth-error" style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            type="button"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: 'white', color: 'black', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1.5rem' }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
            Συνέχεια με Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.5rem 0', color: '#666', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            ή με Email
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Όνομα Καλλιτέχνη" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', outline: 'none' }}
              />
            )}
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', outline: 'none' }}
            />
            <input 
              type="password" 
              placeholder="Κωδικός" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength="6"
              style={{ width: '100%', padding: '12px 15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'white', outline: 'none' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}
            >
              {loading ? 'Φόρτωση...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#aaa' }}>
            {isLogin ? 'Δεν έχεις λογαριασμό; ' : 'Έχεις ήδη λογαριασμό; '}
            <span 
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page page-container container">
      <div className="dashboard-header glass">
        <div className="user-profile">
          <div className="user-avatar">
            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'V'}
          </div>
          <div>
            <h1>Welcome, {currentUser.displayName || 'Artist'}</h1>
            <p>{currentUser.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card glass">
          <div className="card-header">
            <Ticket color="#ff1493" />
            <h2>VIP Εκπτώσεις</h2>
          </div>
          <div className="discount-banner">
            <p>Χρησιμοποίησε τον παρακάτω κωδικό στο ταμείο (Payhip) για έκπτωση!</p>
            <div className="discount-code">{discountCode}</div>
          </div>
        </div>

        <div className="dashboard-card glass">
          <div className="card-header">
            <Music color="#bc74f5" />
            <h2>My Beats & Leases</h2>
          </div>
          
          {beats.length > 0 ? (
            <ul className="purchases-list">
              {beats.map((purchase, idx) => (
                <li key={idx} className="purchase-item">
                  <div className="purchase-info">
                    <Music size={16} color="#aaa" style={{ marginRight: '8px' }} />
                    <span>{purchase.trackTitle}</span>
                  </div>
                  <span className="purchase-type">{purchase.licenseType}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <AlertCircle size={40} opacity={0.5} />
              <p>Δεν έχεις αγοράσει Instrumentals ακόμα.</p>
            </div>
          )}
        </div>

        <div className="dashboard-card glass">
          <div className="card-header">
            <ShoppingBag color="#bc74f5" />
            <h2>My Songs</h2>
          </div>
          
          {songs.length > 0 ? (
            <ul className="purchases-list">
              {songs.map((purchase, idx) => (
                <li key={idx} className="purchase-item">
                  <div className="purchase-info">
                    <ShoppingBag size={16} color="#aaa" style={{ marginRight: '8px' }} />
                    <span>{purchase.trackTitle}</span>
                  </div>
                  <span className="purchase-type">{purchase.licenseType}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <AlertCircle size={40} opacity={0.5} />
              <p>Δεν έχεις αγοράσει Songs/Kits ακόμα.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
