// Τιμές, προσφορές και υπολογισμός καλαθιού του VMT beat store.
// Το ίδιο αρχείο το χρησιμοποιούν το site (για να δείχνει το σύνολο) και ο server
// (/api/vmt-checkout, που είναι αυτός που αποφασίζει τι χρεώνεται). Αλλάζεις
// τιμές ή προσφορές μόνο εδώ.
import beatsData from './beats.json';
import { tierForPurchases } from './loyaltyTiers';

// Τιμές σε λεπτά.
export const LICENSE_PRICES = { mp3: 1999, wav: 2499, stems: 4999 };
export const LICENSE_NAMES = { mp3: 'MP3', wav: 'WAV', stems: 'Stems' };

export const PROMOS = {
  // Πάρε 2, το 3ο (το φθηνότερο) δωρεάν. Ισχύει για κάθε τριάδα στο καλάθι.
  bundle: { active: true, buy: 2, free: 1, label: 'Πάρε 2, το 3ο δώρο' },
  // Black Friday: όλοι παίρνουν percent. Οι VIP παίρνουν το μεγαλύτερο από τα δύο συν vipBonus.
  // Ημερομηνίες σε ώρα Ελλάδας (ISO με +02:00 / +03:00).
  blackFriday: { start: '2026-11-27T00:00:00+02:00', end: '2026-12-01T00:00:00+02:00', percent: 20, vipBonus: 5, label: 'Black Friday' },
};

export const slugOf = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Ποιες άδειες μπορούν να μπουν στο καλάθι για κάθε beat (όσες έχουν αρχεία).
export function beatBySlug(slug) {
  return (beatsData.beatslist || []).find((b) => slugOf(b.title) === slug) || null;
}
export function licensesFor(beat) {
  return Object.keys(LICENSE_PRICES).filter((k) => beat?.files?.[k]);
}

export function blackFridayActive(now = new Date()) {
  const bf = PROMOS.blackFriday;
  return now >= new Date(bf.start) && now < new Date(bf.end);
}

// Ποσοστό έκπτωσης για όλο το καλάθι (VIP και Black Friday δεν αθροίζονται,
// εκτός από το μπόνους των VIP στη Black Friday).
export function discountPercent(beatCount = 0, now = new Date()) {
  const vip = tierForPurchases(beatCount).tier.percent;
  if (!blackFridayActive(now)) return { percent: vip, reason: vip ? 'VIP' : '' };
  const bf = PROMOS.blackFriday;
  if (!vip) return { percent: bf.percent, reason: bf.label };
  return { percent: Math.max(vip, bf.percent) + bf.vipBonus, reason: `${bf.label} + VIP` };
}

// items: [{ slug, license }]. Επιστρέφει γραμμές, δώρα, έκπτωση και σύνολο σε λεπτά.
export function priceCart(items, beatCount = 0, now = new Date()) {
  // Ένα beat μία φορά: αν έρθει δύο φορές, κρατάμε την τελευταία άδεια.
  const unique = [...new Map(items.map((it) => [it.slug, it])).values()];
  const lines = unique
    .map((it) => {
      const beat = beatBySlug(it.slug);
      if (!beat || beat.status === 'sold' || !licensesFor(beat).includes(it.license)) return null;
      return { slug: it.slug, title: beat.title, license: it.license, price: LICENSE_PRICES[it.license], free: false };
    })
    .filter(Boolean);

  const { bundle } = PROMOS;
  if (bundle.active) {
    const group = bundle.buy + bundle.free;
    const freeCount = Math.floor(lines.length / group) * bundle.free;
    [...lines].sort((a, b) => a.price - b.price).slice(0, freeCount).forEach((l) => { l.free = true; });
  }

  const subtotal = lines.reduce((s, l) => s + l.price, 0);
  const afterBundle = lines.reduce((s, l) => s + (l.free ? 0 : l.price), 0);
  const { percent, reason } = discountPercent(beatCount, now);
  const discount = Math.round((afterBundle * percent) / 100);
  return {
    lines,
    subtotal,
    bundleSaving: subtotal - afterBundle,
    percent,
    reason,
    discount,
    total: afterBundle - discount,
  };
}

export const euro = (cents) => `${(cents / 100).toFixed(2).replace('.', ',')}€`;

// ---- Μετά την αγορά: ανανέωση MP3, «Κάν' το WAV», «Πάρε και τα stems» ----
// Τιμές σε λεπτά. Τα σκαλοπάτια των stems: έκπτωση στη διαφορά τιμής, ανάλογα με τις μέρες από την αγορά.
export const AFTER = {
  renewMp3: 500,
  toWav: 999,
  stemsSteps: [{ days: 7, off: 50 }, { days: 30, off: 25 }],
};
const DAY = 864e5;

// Τι μπορεί να πάρει ακόμα ο κάτοχος μιας άδειας. license: 'MP3' | 'WAV' | 'Stems'.
export function afterOffers({ license, createdAt, expiresAt, slug }, now = new Date()) {
  const lic = String(license || '').toLowerCase();
  const beat = beatBySlug(slug);
  const out = [];
  if (lic === 'mp3') {
    const left = expiresAt ? (new Date(expiresAt) - now) / DAY : 0;
    if (left < 60) out.push({ kind: 'renew', price: AFTER.renewMp3, label: 'Ανανέωση για 1 χρόνο' });
    if (beat?.files?.wav) out.push({ kind: 'wav', price: AFTER.toWav, label: "Κάν' το WAV για πάντα" });
  }
  if ((lic === 'mp3' || lic === 'wav') && beat?.files?.stems) {
    const diff = LICENSE_PRICES.stems - LICENSE_PRICES[lic];
    const age = (now - new Date(createdAt || now)) / DAY;
    const step = AFTER.stemsSteps.find((s) => age < s.days);
    const off = step ? step.off : 0;
    const price = off ? Math.round(diff * (1 - off / 100)) - 1 : diff; // 14,99 αντί για 15,00
    const until = step ? new Date(new Date(createdAt).getTime() + step.days * DAY).toISOString() : null;
    out.push({ kind: 'stems', price, full: diff, off, until, label: 'Πάρε και τα stems' });
  }
  return out;
}
