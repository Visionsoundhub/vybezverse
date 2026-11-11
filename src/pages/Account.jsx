import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Ticket, Music, AlertCircle, ShoppingBag, Heart, Play, Pause } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LoyaltyProgressBar from '../components/LoyaltyProgressBar';
import { tierForPurchases, discountLabel } from '../data/loyaltyTiers';
import useBeatPurchases from '../utils/useBeatPurchases';
import useVmtLikes from '../utils/useVmtLikes';
import beatsData from '../data/beats.json';
import { slugOf } from '../data/vmtPricing';
import './Account.css';

// Αγαπημένα beats (καρδιές από το store): ακρόαση εδώ, αγορά στη σελίδα του beat.
function Favorites() {
  const likes = useVmtLikes();
  const audio = useRef(null);
  const [playing, setPlaying] = useState('');
  useEffect(() => () => audio.current?.pause(), []);
  const bySlug = Object.fromEntries(beatsData.beatslist.map((b) => [slugOf(b.title), b]));
  const list = likes.mine.map((s) => bySlug[s]).filter(Boolean);
  const play = (b) => {
    const slug = slugOf(b.title);
    if (playing === slug) { audio.current?.pause(); setPlaying(''); return; }
    audio.current?.pause();
    const a = new Audio(b.audioSrc);
    a.onended = () => setPlaying('');
    a.play().catch(() => setPlaying(''));
    audio.current = a;
    setPlaying(slug);
  };
  return (
    <div className="account-card account-favs">
      <div className="account-card-header">
        <Heart size={20} color="var(--accent)" />
        <h2>Αγαπημένα</h2>
      </div>
      {!likes.ready ? null : list.length > 0 ? (
        <ul className="account-fav-list">
          {list.map((b) => {
            const slug = slugOf(b.title);
            const sold = b.status === 'sold';
            return (
              <li key={slug}>
                <button className={`account-fav-play ${playing === slug ? 'on' : ''}`} onClick={() => play(b)} aria-label={playing === slug ? 'Pause' : 'Play'}>
                  {playing === slug ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <img src={b.cover} alt="" loading="lazy" />
                <div className="account-fav-main">
                  <a href={`/beats/${slug}`}>{b.title}</a>
                  <span>{b.bpm} BPM · {b.key}</span>
                </div>
                <button className="account-fav-heart" onClick={() => likes.toggle(slug)} aria-label="Βγάλ' το από τα αγαπημένα" title="Βγάλ' το από τα αγαπημένα">
                  <Heart size={16} fill="currentColor" />
                </button>
                {sold ? <span className="account-fav-sold">SOLD</span> : <a className="btn-primary account-fav-buy" href={`/beats/${slug}`}>Αγορά</a>}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="account-empty-state">
          <Heart size={36} opacity={0.5} />
          <p>Πάτα την καρδιά σε όποιο beat σου αρέσει και θα το βρίσκεις εδώ.</p>
          <a href="/beats" className="btn-outline" style={{ marginTop: 16, display: 'inline-block' }}>Δες τα beats</a>
        </div>
      )}
    </div>
  );
}

function Account() {
  const { currentUser, logout, login, signup, loginWithGoogle, authLoading } = useAuth();
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

  // Αγορές από account + Polar (ίδια πηγή με τη μπάρα VIP).
  const merged = useBeatPurchases();

  useEffect(() => {
    if (!currentUser) return;

    const fetchAccountData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Optional site-wide promo code. No fallback: showing a made-up code
        // would send customers to checkout with something Lemon Squeezy
        // rejects.
        const discountDoc = await getDoc(doc(db, 'global_settings', 'discounts'));
        if (discountDoc.exists() && discountDoc.data().activeCode) {
          setDiscountCode(discountDoc.data().activeCode);
        }
      } catch (e) {
        console.error('Error fetching account data', e);
      }
    };

    fetchAccountData();
  }, [currentUser]);

  // Μετά τη σύνδεση γυρνάει εκεί που ήταν (π.χ. ?next=/beats από το beat store).
  useEffect(() => {
    if (!currentUser) return;
    const next = new URLSearchParams(window.location.search).get('next') || '';
    if (next.startsWith('/') && !next.startsWith('//')) navigate(next, { replace: true });
  }, [currentUser, navigate]);

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

  const { beats, releases: songs } = merged;

  if (authLoading) return <div style={{ minHeight: "70vh" }} />;
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

          <p className="account-legal">
            Με τη σύνδεση ή την εγγραφή δέχεσαι τους <a href="/beats/oroi">όρους</a> και την <a href="/privacy">πολιτική απορρήτου</a>.
          </p>

          <p className="account-toggle">
            {isLogin ? 'Δεν έχεις λογαριασμό; ' : 'Έχεις ήδη λογαριασμό; '}
            <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</span>
          </p>
        </div>
      </div>
    );
  }

  const purchaseCount = beats.length;
  const { tier: vipTier, next: vipNext } = tierForPurchases(purchaseCount);
  const vipCode = merged.vipCode;

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

      {!currentUser.emailVerified && (
        <div className="account-alert account-alert-error">
          Επιβεβαίωσε το email σου για να εμφανιστούν εδώ τα beats που αγόρασες με αυτό το email. Σου στείλαμε link.{' '}
          <button className="account-verify-btn" onClick={async () => {
            try {
              const { sendEmailVerification } = await import('firebase/auth');
              await sendEmailVerification(currentUser, { url: `${window.location.origin}/account` });
              setUpdateMessage('Σου ξαναστείλαμε το email επιβεβαίωσης.');
            } catch { setUpdateError('Δεν στάλθηκε, δοκίμασε σε λίγο.'); }
          }}>Στείλε το ξανά</button>
        </div>
      )}
      <LoyaltyProgressBar />

      <div className="account-grid">
        <div className="account-card">
          <div className="account-card-header">
            <Ticket size={20} color="var(--accent)" />
            <h2>VIP Έκπτωση</h2>
          </div>
          <div className="account-discount-banner">
            {vipTier.percent > 0 ? (
              <>
                <p>Έκπτωση για πάντα σε κάθε beat. Μπαίνει μόνη της στο σύνολο του καλαθιού, δεν χρειάζεται κωδικός.</p>
                <div className="account-discount-code">−{discountLabel(vipTier)}</div>
              </>
            ) : discountCode ? (
              <>
                <p>Χρησιμοποίησε τον παρακάτω κωδικό στο ταμείο για την έκπτωσή σου.</p>
                <div className="account-discount-code">{discountCode}</div>
              </>
            ) : (
              <p>{vipNext
                ? `Αγόρασε ${vipNext.threshold - purchaseCount} beats ακόμα για να ξεκλειδώσεις έκπτωση ${discountLabel(vipNext)} στο ${vipNext.name}.`
                : 'Ο κωδικός σου ετοιμάζεται. Αν δεν εμφανιστεί σε λίγο, στείλε μας ένα email.'}</p>
            )}
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
                  <span><Music size={16} /> {purchase.product}</span>
                  <span className="account-purchase-type">
                    {purchase.amount ? `${purchase.amount}€` : ''}
                    {purchase.expiresAt && (() => {
                      const days = Math.ceil((new Date(purchase.expiresAt) - Date.now()) / 864e5);
                      return <> · {days > 0 ? `λήγει σε ${days} μέρες` : 'έληξε'}</>;
                    })()}
                    {purchase.downloads?.length > 0 ? (
                      purchase.downloads.map((d) => (
                        <React.Fragment key={d.label}> · <a href={d.url}>{d.label}</a></React.Fragment>
                      ))
                    ) : purchase.source === 'polar' && (
                      <> · <a href="https://polar.sh/visionsound/portal" target="_blank" rel="noopener noreferrer">Κατέβασε τα αρχεία</a></>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="account-empty-state">
              <AlertCircle size={36} opacity={0.5} />
              <p>Δεν έχεις πάρει beat ακόμα.</p>
              <a href="/beats" className="btn-outline" style={{ marginTop: 16, display: 'inline-block' }}>Δες τα beats</a>
            </div>
          )}
        </div>

        <Favorites />

        <div className="account-card">
          <div className="account-card-header">
            <ShoppingBag size={20} color="var(--accent)" />
            <h2>Τα Songs μου</h2>
          </div>
          {songs.length > 0 ? (
            <ul className="account-purchases-list">
              {songs.map((purchase, idx) => (
                <li key={idx}>
                  <span><ShoppingBag size={16} /> {purchase.product}</span>
                  <span className="account-purchase-type">{purchase.amount ? `${purchase.amount}€` : ''}</span>
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
