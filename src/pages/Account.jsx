import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Ticket, Music, AlertCircle, ShoppingBag } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LoyaltyProgressBar from '../components/LoyaltyProgressBar';
import './Account.css';

function Account() {
  const { currentUser, logout, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [discountCode, setDiscountCode] = useState(null);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const fetchAccountData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const discountDoc = await getDoc(doc(db, 'global_settings', 'discounts'));
        if (discountDoc.exists() && discountDoc.data().activeCode) {
          setDiscountCode(discountDoc.data().activeCode);
        } else {
          setDiscountCode('VYBEZ2026');
        }
      } catch (e) {
        console.error('Error fetching account data', e);
      }
    };

    fetchAccountData();
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMessage('');
    setUpdateError('');
    try {
      if (newUsername) {
        await updateProfile(currentUser, { displayName: newUsername });
      }
      if (newPassword) {
        await updatePassword(currentUser, newPassword);
      }
      setUpdateMessage('Το προφίλ ενημερώθηκε επιτυχώς!');
      setNewUsername('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setUpdateError('Σφάλμα: ' + err.message);
    }
  };

  const beats = userData?.purchases?.filter(p => p.licenseType?.toLowerCase().includes('lease') || p.licenseType?.toLowerCase().includes('exclusive')) || [];
  const songs = userData?.purchases?.filter(p => !p.licenseType?.toLowerCase().includes('lease') && !p.licenseType?.toLowerCase().includes('exclusive') && p.licenseType) || [];

  if (!currentUser) {
    return (
      <div className="account-page container">
        <div className="account-auth-box">
          <h2>{isLogin ? 'ΚΑΛΩΣ ΗΡΘΕΣ ΠΙΣΩ' : 'ΓΙΝΕ ΜΕΛΟΣ'}</h2>
          <p className="account-auth-sub">
            {isLogin ? 'Συνδέσου στο λογαριασμό σου.' : 'Δημιούργησε λογαριασμό για να έχεις τα beats σου σε ένα μέρος.'}
          </p>

          {error && <div className="account-alert account-alert-error">{error}</div>}

          <button onClick={handleGoogleAuth} disabled={loading} type="button" className="account-google-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="18" />
            Συνέχεια με Google
          </button>

          <div className="account-divider"><span /> ή με Email <span /></div>

          <form onSubmit={handleAuthSubmit} className="account-form">
            {!isLogin && (
              <input type="text" placeholder="Όνομα Καλλιτέχνη" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Κωδικός" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Φόρτωση...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
            </button>
          </form>

          <p className="account-toggle">
            {isLogin ? 'Δεν έχεις λογαριασμό; ' : 'Έχεις ήδη λογαριασμό; '}
            <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page container">
      <div className="account-header">
        <div className="account-profile">
          <div className="account-avatar">
            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'V'}
          </div>
          <div>
            <h1>Καλωσόρισες, {currentUser.displayName || 'Artist'}</h1>
            <p>{currentUser.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-outline account-logout-btn">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <LoyaltyProgressBar />

      <div className="account-grid">
        <div className="account-card">
          <div className="account-card-header">
            <Ticket size={20} color="var(--accent)" />
            <h2>VIP Έκπτωση</h2>
          </div>
          <div className="account-discount-banner">
            <p>Χρησιμοποίησε τον παρακάτω κωδικό στο ταμείο για την έκπτωσή σου.</p>
            <div className="account-discount-code">{discountCode}</div>
          </div>
        </div>

        <div className="account-card">
          <div className="account-card-header">
            <Music size={20} color="var(--accent)" />
            <h2>Τα Beats μου</h2>
          </div>
          {beats.length > 0 ? (
            <ul className="account-purchases-list">
              {beats.map((purchase, idx) => (
                <li key={idx}>
                  <span><Music size={16} /> {purchase.trackTitle}</span>
                  <span className="account-purchase-type">{purchase.licenseType}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="account-empty-state">
              <AlertCircle size={36} opacity={0.5} />
              <p>Δεν έχεις αγοράσει Instrumentals ακόμα.</p>
            </div>
          )}
        </div>

        <div className="account-card">
          <div className="account-card-header">
            <ShoppingBag size={20} color="var(--accent)" />
            <h2>Τα Songs μου</h2>
          </div>
          {songs.length > 0 ? (
            <ul className="account-purchases-list">
              {songs.map((purchase, idx) => (
                <li key={idx}>
                  <span><ShoppingBag size={16} /> {purchase.trackTitle}</span>
                  <span className="account-purchase-type">{purchase.licenseType}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="account-empty-state">
              <AlertCircle size={36} opacity={0.5} />
              <p>Δεν έχεις αγοράσει Songs ακόμα.</p>
            </div>
          )}
        </div>

        <div className="account-card">
          <div className="account-card-header">
            <Ticket size={20} color="var(--accent)" />
            <h2>Ενημέρωση Προφίλ</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="account-form account-form-inline">
            {updateMessage && <div className="account-alert account-alert-success">{updateMessage}</div>}
            {updateError && <div className="account-alert account-alert-error">{updateError}</div>}

            <input type="text" placeholder="Νέο Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
            <input type="password" placeholder="Νέος Κωδικός" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength="6" />
            <button type="submit" className="btn-primary">ΑΠΟΘΗΚΕΥΣΗ</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Account;
