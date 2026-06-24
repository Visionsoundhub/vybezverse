import React, { useState, useEffect } from 'react';
import './LoyaltyProgressBar.css';
import { Star, Award, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LoyaltyProgressBar = () => {
  const { currentUser } = useAuth();
  const [purchasesCount, setPurchasesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchPurchases = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPurchasesCount(data.purchases ? data.purchases.length : 0);
        }
      } catch (err) {
        console.error("Failed to fetch purchases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [currentUser]);

  if (!currentUser) return null;
  if (loading) return <div className="loyalty-container glass skeleton-loader"></div>;

  const tiers = [
    { name: 'Bronze', threshold: 0, max: 5, discount: '15%', icon: <Star color="#cd7f32" size={24} /> },
    { name: 'Silver', threshold: 6, max: 10, discount: '25%', icon: <Award color="#c0c0c0" size={24} /> },
    { name: 'Gold', threshold: 11, max: null, discount: '40%', icon: <Zap color="#ffd700" size={24} /> }
  ];

  let currentTierIndex = 0;
  if (purchasesCount >= 11) currentTierIndex = 2;
  else if (purchasesCount >= 6) currentTierIndex = 1;

  const currentTier = tiers[currentTierIndex];
  const nextTier = currentTierIndex < 2 ? tiers[currentTierIndex + 1] : null;

  // Calculate progress within current tier
  let progressPercent = 100;
  let remaining = 0;
  if (nextTier) {
    const tierRange = nextTier.threshold - currentTier.threshold;
    const progressInTier = purchasesCount - currentTier.threshold;
    progressPercent = (progressInTier / tierRange) * 100;
    remaining = nextTier.threshold - purchasesCount;
  }

  return (
    <div className="loyalty-container glass">
      <div className="loyalty-header">
        <div className="tier-badge">
          {currentTier.icon}
          <div>
            <h3>{currentTier.name} Member</h3>
            <p>VIP Έκπτωση: {currentTier.discount}</p>
          </div>
        </div>
        {nextTier ? (
          <div className="loyalty-status">
            Αγόρασε <strong>{remaining}</strong> beats ακόμα για το <strong>{nextTier.name}</strong> ({nextTier.discount})
          </div>
        ) : (
          <div className="loyalty-status gold-status">
            Έχεις φτάσει στο μέγιστο Level! (40% OFF)
          </div>
        )}
      </div>

      <div className="progress-track">
        <div 
          className={`progress-fill ${currentTier.name.toLowerCase()}`}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      
      <div className="progress-labels">
        <span>{currentTier.name}</span>
        <span>{nextTier ? nextTier.name : 'Max Level'}</span>
      </div>
    </div>
  );
};

export default LoyaltyProgressBar;
