import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './LoyaltyProgressBar.css';
import { Star, Award, Zap, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LOYALTY_TIERS, tierForPurchases, discountLabel } from '../data/loyaltyTiers';
import useBeatPurchases from '../utils/useBeatPurchases';
import { VMT_TEXT } from '../data/vmtI18n';

const LoyaltyProgressBar = ({ lang = 'el' }) => {
  const t = VMT_TEXT[lang].loyalty;
  const { currentUser } = useAuth();
  const { loading, beatCount: purchasesCount, vipCode } = useBeatPurchases();
  const [showInfo, setShowInfo] = useState(false);

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
            <p>{t.discount}: {discountLabel(currentTier)}{vipCode ? `, ${t.code} ${vipCode}` : ''}</p>
          </div>
        </div>
        {nextTier ? (
          <div className="loyalty-status">
            {t.buyMore(remaining, nextTier.name, discountLabel(nextTier))}
          </div>
        ) : (
          <div className="loyalty-status gold-status">
            {t.max(discountLabel(currentTier))}
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

      {showInfo && createPortal(
        <div className="loyalty-info-modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="loyalty-info-modal glass" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setShowInfo(false)}><X size={20}/></button>
            <h4>{t.how}</h4>
            <p>{t.howText}</p>
            <ul>
              {LOYALTY_TIERS.map((tier, i) => {
                const next = LOYALTY_TIERS[i + 1];
                const range = next ? `${tier.threshold}-${next.threshold - 1}` : `${tier.threshold}+`;
                return (
                  <li key={tier.key}>
                    <strong>{tier.name} ({range} Beats):</strong>{' '}
                    {tier.percent ? t.unlock(tier.percent) : t.start}
                  </li>
                );
              })}
            </ul>
            <p className="note">{t.note}</p>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default LoyaltyProgressBar;
