// Ανανέωση MP3, «Κάν' το WAV» και «Πάρε και τα stems» για άδεια που υπάρχει ήδη.
// Μόνο ο κάτοχος (συνδεδεμένος, με επιβεβαιωμένο email). Την τιμή την υπολογίζει ο server.
import { afterOffers } from '../../src/data/vmtPricing';
import { json, userFromRequest, firestoreToken } from '../../src/utils/vmtServer';

const CART_PRODUCT = '6fe3890a-0cde-4fe0-9068-b62c4c3ef61c'; // «VMT Beats» στο Polar

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const licenseId = String(body.licenseId || '');
  const kind = String(body.kind || '');
  if (!licenseId || !['renew', 'wav', 'stems'].includes(kind)) return json({ error: 'Λάθος αίτημα.' }, 400);

  const user = await userFromRequest(request, env);
  if (!user?.email || !user.email_verified) return json({ error: 'Μπες στο account σου πρώτα.' }, 401);

  const token = await firestoreToken(env);
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/vmt_licenses/${encodeURIComponent(licenseId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return json({ error: 'Η άδεια δεν βρέθηκε.' }, 404);
  const f = (await r.json()).fields || {};
  const v = (k) => f[k]?.stringValue || '';
  if (v('email') !== user.email.toLowerCase()) return json({ error: 'Η άδεια δεν είναι δική σου.' }, 403);

  const offer = afterOffers({ license: v('license'), createdAt: v('createdAt'), expiresAt: v('expiresAt'), slug: v('slug') })
    .find((o) => o.kind === kind);
  if (!offer) return json({ error: 'Αυτό δεν είναι διαθέσιμο για την άδειά σου.' }, 400);

  const origin = new URL(request.url).origin;
  const res = await fetch('https://api.polar.sh/v1/checkouts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.POLAR_TOKEN}` },
    body: JSON.stringify({
      products: [CART_PRODUCT],
      prices: { [CART_PRODUCT]: [{ amount_type: 'fixed', price_amount: offer.price, price_currency: 'eur' }] },
      allow_discount_codes: false,
      embed_origin: origin,
      success_url: `${origin}/beats?paid=1`,
      customer_email: user.email.toLowerCase(),
      metadata: { brand: 'vmt', kind: 'upgrade', license: licenseId, to: kind },
    }),
  });
  if (!res.ok) {
    console.error('Polar upgrade checkout failed:', res.status, await res.text());
    return json({ error: 'Η πληρωμή δεν άνοιξε, δοκίμασε ξανά.' }, 400);
  }
  const co = await res.json();
  return json({ url: co.url, beat: v('beat'), offer });
}
