import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, X } from 'lucide-react';
import './HeroAccount.css';

const TIERS = [
  { name: 'Starter', min: 0, discount: '—' },
  { name: 'Bronze', min: 3, discount: '10%' },
  { name: 'Silver', min: 6, discount: '20%' },
  { name: 'Gold', min: 10, discount: '30%' },
];

function tierFor(count) {
  if (count >= 10) return TIERS[3];
  if (count >= 6) return TIERS[2];
  if (count >= 3) return TIERS[1];
  return TIERS[0];
}

export default function HeroAccount() {
  const { currentUser, login, signup, loginWithGoogle } = useAuth();
  // Open by default on desktop (matches the site's hero-grid breakpoint);
  // on mobile it starts collapsed so it doesn't cover the hero, just the
  // ΣΥΝΔΕΣΗ trigger shows until tapped.
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 861px)').matches);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [purchasesCount, setPurchasesCount] = useState(0);
  const [discountCode, setDiscountCode] = useState(null);
  const popRef = useRef(null);

  // Fetch quick stats once logged in
  useEffect(() => {
    if (!currentUser) return;
    let alive = true;
    (async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (alive && userDoc.exists()) {
          const data = userDoc.data();
          setPurchasesCount(data.purchases ? data.purchases.length : 0);
        }
        const discountDoc = await getDoc(doc(db, 'global_settings', 'discounts'));
        if (alive) {
          setDiscountCode(
            discountDoc.exists() && discountDoc.data().activeCode
              ? discountDoc.data().activeCode
              : 'VYBEZ2026'
          );
        }
      } catch (e) {
        console.error('HeroAccount stats fetch failed', e);
      }
    })();
    return () => { alive = false; };
  }, [currentUser]);

  // Close popover on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Auto-close the form the moment auth succeeds → stats take over
  useEffect(() => { if (currentUser) setOpen(false); }, [currentUser]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await signup(email, password, name);
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
      setError('Το Google Login απέτυχε.');
    }
    setLoading(false);
  };

  // --- Logged in: quick stats strip ---
  if (currentUser) {
    const tier = tierFor(purchasesCount);
    const initial = currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'V';
    return (
      <Link to="/account" className="ha-stats" title="Πήγαινε στο προφίλ σου">
        <span className="ha-avatar">{initial}</span>
        <span className="ha-stat"><b>{tier.name}</b><i>tier</i></span>
        <span className="ha-sep" />
        <span className="ha-stat"><b>{tier.discount}</b><i>vip</i></span>
        <span className="ha-sep" />
        <span className="ha-stat"><b>{purchasesCount}</b><i>beats</i></span>
        {discountCode && <span className="ha-code">{discountCode}</span>}
      </Link>
    );
  }

  // --- Logged out: discreet trigger + popover ---
  return (
    <div className="ha-root" ref={popRef}>
      <button className="ha-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <User size={13} /> Σύνδεση
      </button>

      {open && (
        <div className="ha-pop" role="dialog" aria-label="Σύνδεση">
          <button className="ha-close" onClick={() => setOpen(false)} aria-label="Κλείσιμο"><X size={15} /></button>
          <div className="ha-pop-title">{isLogin ? 'Καλώς ήρθες πίσω' : 'Γίνε μέλος'}</div>

          {error && <div className="ha-error">{error}</div>}

          <button type="button" className="ha-google" onClick={handleGoogleAuth} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="16" />
            Συνέχεια με Google
          </button>

          <div className="ha-divider"><span /> ή <span /></div>

          <form className="ha-form" onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <input type="text" placeholder="Όνομα Καλλιτέχνη" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Κωδικός" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
            <button type="submit" className="btn-primary ha-submit" disabled={loading}>
              {loading ? '...' : (isLogin ? 'Login' : 'Sign up')}
            </button>
          </form>

          <button className="ha-toggle" onClick={() => setIsLogin(v => !v)}>
            {isLogin ? 'Δεν έχεις λογαριασμό; Sign up' : 'Έχεις λογαριασμό; Login'}
          </button>
        </div>
      )}
    </div>
  );
}
