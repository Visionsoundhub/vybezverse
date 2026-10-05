import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { splitPurchases } from '../data/purchaseHelpers';
import { tierForPurchases } from '../data/loyaltyTiers';

// Όλες οι αγορές του χρήστη σε ένα σημείο: όσες είναι γραμμένες στο account του
// και οι άδειες beats του Polar με το email του (χωρίς διπλά). Από εδώ διαβάζουν
// η μπάρα VIP, το account και το beat store, για να δείχνουν όλα το ίδιο νούμερο.
export default function useBeatPurchases() {
  const { currentUser } = useAuth();
  const [state, setState] = useState({ loading: true, purchases: [], vipCode: null });

  useEffect(() => {
    if (!currentUser) {
      setState({ loading: false, purchases: [], vipCode: null, firstEligible: false });
      return;
    }
    let alive = true;
    (async () => {
      const [docSnap, polar] = await Promise.all([
        getDoc(doc(db, 'users', currentUser.uid)).catch(() => null),
        currentUser.getIdToken()
          .then((t) => fetch('/api/my-licenses', { headers: { Authorization: `Bearer ${t}` } }))
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({})),
      ]);
      const data = docSnap?.exists() ? docSnap.data() : {};
      const lic = new Map((polar.licenses || []).map((l) => [l.orderId, l]));
      // Οι αγορές του account παίρνουν τα links λήψης από την αντίστοιχη άδεια.
      const own = (data.purchases || []).map((p) => (lic.has(p.orderId) ? { ...p, ...lic.get(p.orderId) } : p));
      const known = new Set(own.map((p) => p.orderId));
      const purchases = [...own, ...(polar.licenses || []).filter((l) => !known.has(l.orderId))];
      // Πρώτη αγορά: μόνο αν δεν υπάρχει καμία αγορά ούτε στο account
      const firstEligible = !!polar.firstEligible && purchases.length === 0;
      if (alive) setState({ loading: false, purchases, vipCode: polar.vipCode || null, firstEligible });
    })();
    return () => { alive = false; };
  }, [currentUser]);

  const { beats, releases } = splitPurchases(state.purchases);
  // Κωδικός VIP μόνο όταν το επίπεδο δίνει έκπτωση (όχι παλιοί κωδικοί πριν τα 3 beats).
  const { tier } = tierForPurchases(beats.length);
  const vipCode = tier.percent > 0 ? state.vipCode : null;
  return { ...state, vipCode, beats, releases, beatCount: beats.length };
}
