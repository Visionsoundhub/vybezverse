import React, { useState, useEffect } from 'react';
import './LoyaltyProgressBar.css';
import { Star, Award, Zap, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { LOYALTY_TIERS, tierForPurchases, discountLabel } from '../data/loyaltyTiers';
import { splitPurchases } from '../data/purchaseHelpers';

const LoyaltyProgressBar = () => {
  const { currentUser } = useAuth();
  const [purchasesCount, setPurchasesCount] = useState(0);
  const [vipCode, setVipCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchPurchases = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPurchasesCount(splitPurchases(data.purchases).beats.length);
          setVipCode(data.vipCode || null);
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

  const tierIcons = {
    starter: <Star color="#888" size={24} />,
    bronze: <Star color="#cd7f32" size={24} />,
    silver: <Award color="#c0c0c0" size={24} />,
    gold: <Zap color="#ffd700" size={24} />,
  };

  const { index: currentTierIndex, tier: currentTier, next: nextTier } = tierForPurchases(purchasesCount);

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
          {tierIcons[currentTier.key]}
          <div>
            <div className="tier-title-row">
              <h3>{currentTier.name} Member</h3>
              <button className="btn-info" onClick={() => setShowInfo(true)}>
                <Info size={16} />
              </button>
            </div>
            <p>VIP Έκπτωση: {discountLabel(currentTier)}{vipCode ? `, κωδικός ${vipCode}` : ''}</p>
          </div>
        </div>
        {nextTier ? (
          <div className="loyalty-status">
            Αγόρασε <strong>{remaining}</strong> beats ακόμα για το <strong>{nextTier.name}</strong> ({discountLabel(nextTier)})
          </div>
        ) : (
          <div className="loyalty-status gold-status">
            Έχεις φτάσει στο μέγιστο Level! ({discountLabel(currentTier)} OFF)
          </div>
        )}
      </div>

      <div className="progress-track">
        <div 
          className={`progress-fill ${currentTier.key}`}
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
              {LOYALTY_TIERS.map((tier, i) => {
                const next = LOYALTY_TIERS[i + 1];
                const range = next ? `${tier.threshold}-${next.threshold - 1}` : `${tier.threshold}+`;
                return (
                  <li key={tier.key}>
                    <strong>{tier.name} ({range} Beats):</strong>{' '}
                    {tier.percent ? `Ξεκλειδώνεις -${tier.percent}% μόνιμα.` : 'Η αρχή του ταξιδιού σου.'}
                  </li>
                );
              })}
            </ul>
            <p className="note">* Η έκπτωση VIP εφαρμόζεται πάνω στην αρχική τιμή του Beat (δεν συνδυάζεται με χρονόμετρα προσφορών).</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgressBar;
