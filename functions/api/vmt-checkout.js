// Καλάθι VMT → ένα checkout στο Polar με το σύνολο που υπολογίζουμε εμείς.
// Ο server ξαναϋπολογίζει τα πάντα (τιμές, 2+1, VIP, Black Friday): ό,τι στέλνει το site
// είναι μόνο η λίστα beats και αδειών.
import { priceCart } from '../../src/data/vmtPricing';
import { json, userFromRequest, firestoreToken, licensesByEmail, userDoc, countBeats } from '../../src/utils/vmtServer';

const CART_PRODUCT = '6fe3890a-0cde-4fe0-9068-b62c4c3ef61c'; // «VMT Beats» στο Polar
const MAX_ITEMS = 20;

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const items = (Array.isArray(body.items) ? body.items : [])
    .slice(0, MAX_ITEMS)
    .map((i) => ({ slug: String(i.slug || ''), license: String(i.license || '') }));
  if (!items.length) return json({ error: 'Το καλάθι είναι άδειο.' }, 400);

  // VIP μόνο για συνδεδεμένο χρήστη με επιβεβαιωμένο email.
  let beatCount = 0;
  let email = '';
  const user = await userFromRequest(request, env);
  if (user?.email && user.email_verified) {
    email = user.email.toLowerCase();
    try {
      const token = await firestoreToken(env);
      const [doc, licenses] = await Promise.all([userDoc(env, token, user.user_id || user.sub), licensesByEmail(env, token, email)]);
      beatCount = countBeats(doc, licenses);
    } catch (e) {
      console.error('VIP lookup failed:', e);
    }
  }

  const cart = priceCart(items, beatCount);
  if (!cart.lines.length) return json({ error: 'Κανένα διαθέσιμο beat στο καλάθι.' }, 400);
  if (cart.total < 50) return json({ error: 'Το σύνολο είναι πολύ μικρό.' }, 400);

  // Το Polar κρατάει metadata ως κείμενο έως 500 χαρακτήρες: «slug:άδεια:δωρεάν» χωρισμένα με κόμμα.
  const meta = cart.lines.map((l) => `${l.slug}:${l.license}:${l.free ? 1 : 0}`).join(',');
  const origin = new URL(request.url).origin;
  const res = await fetch('https://api.polar.sh/v1/checkouts/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.POLAR_TOKEN}` },
    body: JSON.stringify({
      products: [CART_PRODUCT],
      prices: { [CART_PRODUCT]: [{ amount_type: 'fixed', price_amount: cart.total, price_currency: 'eur' }] },
      allow_discount_codes: false,
      embed_origin: origin,
      success_url: `${origin}/beats?paid=1`,
      customer_email: email || undefined,
      metadata: {
        brand: 'vmt',
        kind: 'cart',
        items: meta,
        percent: String(cart.percent),
        reason: cart.reason || 'none',
      },
    }),
  });
  if (!res.ok) {
    console.error('Polar checkout failed:', res.status, await res.text());
    return json({ error: 'Η πληρωμή δεν άνοιξε, δοκίμασε ξανά.' }, 400);
  }
  const co = await res.json();
  return json({ url: co.url, cart });
}
