// Οι άδειες beats (από το Polar) του συνδεδεμένου χρήστη, με βάση το email του.
// Έτσι βλέπει τις αγορές του στο account ακόμα κι αν αγόρασε πριν φτιάξει account,
// ή με email και κωδικό αντί για Google. Ο χρήστης στέλνει το Firebase ID token του.
import { getGoogleAccessToken } from '../../src/utils/firebaseAdmin';
import { tierForPurchases } from '../../src/data/loyaltyTiers';
import { isBeatPurchase } from '../../src/data/purchaseHelpers';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

async function verifyIdToken(token, projectId) {
  const [h, p, sig] = (token || '').split('.');
  if (!sig) return null;
  const header = JSON.parse(new TextDecoder().decode(b64url(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
  const now = Date.now() / 1000;
  if (payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
  if (payload.exp < now || payload.iat > now + 60) return null;
  const { keys } = await (await fetch(JWKS_URL, { cf: { cacheTtl: 3600 } })).json();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
  return ok ? payload : null;
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestGet({ request, env }) {
  const idToken = (request.headers.get('Authorization') || '').replace(/^Bearer /, '');
  const user = await verifyIdToken(idToken, env.FIREBASE_PROJECT_ID).catch(() => null);
  if (!user?.email) return json({ error: 'unauthorized' }, 401);
  // Χωρίς επιβεβαιωμένο email κάποιος θα μπορούσε να γραφτεί με ξένο email και να δει τις αγορές του.
  if (!user.email_verified) return json({ licenses: [], needsVerification: true });

  const token = await getGoogleAccessToken(env);
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'vmt_licenses' }],
        where: { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: user.email.toLowerCase() } } },
        limit: 200,
      },
    }),
  });
  const rows = await res.json();
  const licenses = (Array.isArray(rows) ? rows : [])
    .filter((r) => r.document)
    .map(({ document: d }) => {
      const f = d.fields || {};
      const v = (k) => f[k]?.stringValue ?? f[k]?.doubleValue ?? '';
      return {
        orderId: d.name.split('/').pop(),
        product: `${v('beat')} · ${v('license')}`,
        amount: Number(v('amount')) || 0,
        createdAt: v('createdAt'),
        expiresAt: v('expiresAt'),
        license: v('license'),
        source: 'polar',
      };
    });
  // VIP: μετράμε όλα τα beats (account + Polar χωρίς διπλά) και αν ανέβηκε επίπεδο
  // φτιάχνουμε προσωπικό κωδικό στο Polar, ακόμα κι αν οι αγορές έγιναν πριν το account.
  let vipCode = null;
  let vipTier = null;
  try {
    const userDoc = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${user.user_id || user.sub}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => (r.ok ? r.json() : null));
    const docPurchases = (userDoc?.fields?.purchases?.arrayValue?.values || []).map((v) => ({
      orderId: v.mapValue?.fields?.orderId?.stringValue,
      product: v.mapValue?.fields?.product?.stringValue,
    }));
    const known = new Set(docPurchases.map((p) => p.orderId));
    const beats = [...docPurchases, ...licenses.filter((l) => !known.has(l.orderId))].filter(isBeatPurchase);
    const { tier } = tierForPurchases(beats.length);
    vipCode = userDoc?.fields?.vipCode?.stringValue || null;
    vipTier = userDoc?.fields?.vipTier?.stringValue || null;
    if (userDoc && tier.percent > 0 && vipTier !== tier.key && env.POLAR_TOKEN) {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = `VIP${tier.name.toUpperCase()}${[...crypto.getRandomValues(new Uint8Array(6))].map((b) => alphabet[b % alphabet.length]).join('')}`;
      const pr = await fetch('https://api.polar.sh/v1/discounts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.POLAR_TOKEN}` },
        body: JSON.stringify({ name: `VIP ${tier.name}, ${user.email}`, code, type: 'percentage', basis_points: tier.percent * 100, duration: 'once' }),
      });
      if (pr.ok) {
        await fetch(`https://firestore.googleapis.com/v1/${userDoc.name}?updateMask.fieldPaths=vipCode&updateMask.fieldPaths=vipTier`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fields: { vipCode: { stringValue: code }, vipTier: { stringValue: tier.key } } }),
        });
        vipCode = code;
        vipTier = tier.key;
      }
    }
  } catch (e) {
    console.error('VIP check failed:', e);
  }

  return json({ licenses, vipCode, vipTier });
}
