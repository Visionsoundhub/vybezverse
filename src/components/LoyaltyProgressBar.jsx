import React, { useState, useEffect } from 'react';
import './LoyaltyProgressBar.css';
import { Star, Award, Zap, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LoyaltyProgressBar = () => {
  const { currentUser } = useAuth();
  const [purchasesCount, setPurchasesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

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
    { name: 'Starter', threshold: 0, max: 2, discount: '-', icon: <Star color="#888" size={24} /> },
    { name: 'Bronze', threshold: 3, max: 5, discount: '10%', icon: <Star color="#cd7f32" size={24} /> },
    { name: 'Silver', threshold: 6, max: 9, discount: '20%', icon: <Award color="#c0c0c0" size={24} /> },
    { name: 'Gold', threshold: 10, max: null, discount: '30%', icon: <Zap color="#ffd700" size={24} /> }
  ];

  let currentTierIndex = 0;
  if (purchasesCount >= 10) currentTierIndex = 3;
  else if (purchasesCount >= 6) currentTierIndex = 2;
  else if (purchasesCount >= 3) currentTierIndex = 1;

  const currentTier = tiers[currentTierIndex];
  const nextTier = currentTierIndex < 3 ? tiers[currentTierIndex + 1] : null;

  // Calculate progress within current tier
  let progressPercent = 0;
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
            <div className="tier-title-row">
              <h3>{currentTier.name} Member</h3>
              <button className="btn-info" onClick={() => setShowInfo(true)}>
                <Info size={16} />
              </button>
            </div>
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

      {showInfo && (
        <div className="loyalty-info-modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="loyalty-info-modal glass" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setShowInfo(false)}><X size={20}/></button>
            <h4>Πώς δουλεύει το VIP Club;</h4>
            <p>Κάθε φορά που αγοράζεις ένα Beat, ανεβαίνεις Level και ξεκλειδώνεις <strong>μόνιμες εκπτώσεις</strong> για όλες τις μελλοντικές σου αγορές!</p>
            <ul>
              <li><strong>Starter (0-2 Beats):</strong> Η αρχή του ταξιδιού σου.</li>
              <li><strong>Bronze (3-5 Beats):</strong> Ξεκλειδώνεις -10% μόνιμα.</li>
              <li><strong>Silver (6-9 Beats):</strong> Ξεκλειδώνεις -20% μόνιμα.</li>
              <li><strong>Gold (10+ Beats):</strong> Το μέγιστο Level! -30% μόνιμα.</li>
            </ul>
            <p className="note">* Η έκπτωση VIP εφαρμόζεται πάνω στην αρχική τιμή του Beat (δεν συνδυάζεται με χρονόμετρα προσφορών).</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgressBar;
