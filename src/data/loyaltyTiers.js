// Single source of truth for the VIP loyalty tiers.
//
// There are deliberately no discount codes here. Codes used to be three
// shared, unlimited-redemption codes in Lemon Squeezy, which meant one
// customer posting theirs anywhere handed the discount to everyone,
// permanently. Each customer now gets their own code, minted by the
// purchase webhook when they reach a tier and stored on their user
// document, so a leak burns exactly one traceable code.
export const LOYALTY_TIERS = [
  { key: 'starter', name: 'Starter', threshold: 0, percent: 0 },
  { key: 'bronze', name: 'Bronze', threshold: 3, percent: 10 },
  { key: 'silver', name: 'Silver', threshold: 6, percent: 20 },
  { key: 'gold', name: 'Gold', threshold: 10, percent: 30 },
];

// How a tier's discount reads in the UI.
export function discountLabel(tier) {
  return tier && tier.percent ? `${tier.percent}%` : '-';
}

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
