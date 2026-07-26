import beatsData from './beats.json';

// Splits a user's recorded purchases into beats vs. releases (songs).
//
// The webhook only ever stores the Lemon Squeezy product name (no
// dedicated "type" field), so a purchase is a beat when that name matches
// one of the current beats.json entries; everything else is a release.
// This has to be the single place that does that match - Account.jsx and
// HeroAccount.jsx used to each filter on a `licenseType` field nothing
// ever wrote (Account.jsx) or count every purchase indiscriminately
// (HeroAccount.jsx), so the VIP program was silently counting song sales
// toward a "beats" loyalty tier meant to reward instrumental buyers only.
const beatTitles = (beatsData.beatslist || []).map((b) => b.title.toLowerCase());

export function isBeatPurchase(purchase) {
  const name = (purchase.product || '').toLowerCase();
  return beatTitles.some((t) => name.includes(t));
}

export function splitPurchases(purchases) {
  const list = purchases || [];
  return {
    beats: list.filter(isBeatPurchase),
    releases: list.filter((p) => !isBeatPurchase(p)),
  };
}
