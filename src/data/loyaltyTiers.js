// Single source of truth for the VIP loyalty tiers.
//
// `code` must match a real, published discount in Lemon Squeezy - these are
// the codes a customer types at checkout, so a typo here means a broken
// promise to a paying customer.
//
// Used by both LoyaltyProgressBar (the progress card) and the Account page's
// "VIP Έκπτωση" box, so the two can't drift apart.
export const LOYALTY_TIERS = [
  { key: 'starter', name: 'Starter', threshold: 0, discount: '-', code: null },
  { key: 'bronze', name: 'Bronze', threshold: 3, discount: '10%', code: 'MZODIWMW' },
  { key: 'silver', name: 'Silver', threshold: 6, discount: '20%', code: 'C5MTM5MQ' },
  { key: 'gold', name: 'Gold', threshold: 10, discount: '30%', code: 'GYNDG5NQ' },
];

// Resolves a purchase count to its tier, plus the next one to aim for
// (null once the top tier is reached).
export function tierForPurchases(purchaseCount) {
  const count = Number(purchaseCount) || 0;
  let index = 0;
  for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
    if (count >= LOYALTY_TIERS[i].threshold) {
      index = i;
      break;
    }
  }
  return {
    index,
    tier: LOYALTY_TIERS[index],
    next: LOYALTY_TIERS[index + 1] || null,
  };
}
