// Κοινά εργαλεία των Pages Functions του VMT store (checkout, webhook, λήψεις, account).
// Μόνο για server: χρησιμοποιεί secrets από το env.
import { getGoogleAccessToken } from './firebaseAdmin';
import { isBeatPurchase } from '../data/purchaseHelpers';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const toB64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Firebase ID token → στοιχεία χρήστη, ή null.
export async function verifyIdToken(token, projectId) {
  try {
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
  } catch {
    return null;
  }
}

export const userFromRequest = (request, env) =>
  verifyIdToken((request.headers.get('Authorization') || '').replace(/^Bearer /, ''), env.FIREBASE_PROJECT_ID);

const fsBase = (env) => `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export async function firestoreToken(env) {
  return getGoogleAccessToken(env);
}

// Άδειες (vmt_licenses) με αυτό το email.
export async function licensesByEmail(env, token, email) {
  const res = await fetch(`${fsBase(env)}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'vmt_licenses' }],
        where: { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: email.toLowerCase() } } },
        limit: 300,
      },
    }),
  });
  const rows = await res.json();
  return (Array.isArray(rows) ? rows : []).filter((r) => r.document).map(({ document: d }) => {
    const f = d.fields || {};
    const v = (k) => f[k]?.stringValue ?? f[k]?.doubleValue ?? f[k]?.integerValue ?? '';
    return {
      orderId: d.name.split('/').pop(),
      product: `${v('beat')} · ${v('license')}`,
      beat: v('beat'),
      slug: v('slug'),
      license: v('license'),
      amount: Number(v('amount')) || 0,
      createdAt: v('createdAt'),
      expiresAt: v('expiresAt'),
      source: 'polar',
    };
  });
}

export async function userDoc(env, token, uid) {
  const r = await fetch(`${fsBase(env)}/users/${uid}`, { headers: { Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}

// Πόσα beats έχει αγοράσει (account + Polar, χωρίς διπλά). Για το επίπεδο VIP.
export function countBeats(doc, licenses) {
  const own = (doc?.fields?.purchases?.arrayValue?.values || []).map((v) => ({
    orderId: v.mapValue?.fields?.orderId?.stringValue,
    product: v.mapValue?.fields?.product?.stringValue,
  }));
  const known = new Set(own.map((p) => p.orderId));
  return [...own, ...licenses.filter((l) => !known.has(l.orderId))].filter(isBeatPurchase).length;
}

// Πρώτη αγορά: το email δεν έχει καμία πληρωμένη παραγγελία στο Polar. Αν το Polar δεν απαντήσει,
// επιστρέφει false (καλύτερα να μη δοθεί η έκπτωση παρά να δοθεί δεύτερη φορά).
export async function noPaidPolarOrders(env, email) {
  try {
    const h = { Authorization: `Bearer ${env.POLAR_TOKEN}` };
    const c = await fetch(`https://api.polar.sh/v1/customers/?email=${encodeURIComponent(email)}&limit=10`, { headers: h });
    if (!c.ok) return false;
    const customers = ((await c.json()).items || []).filter((x) => (x.email || '').toLowerCase() === email);
    for (const cu of customers) {
      const o = await fetch(`https://api.polar.sh/v1/orders/?customer_id=${cu.id}&limit=50`, { headers: h });
      if (!o.ok) return false;
      if (((await o.json()).items || []).some((x) => x.paid || x.status === 'paid' || x.status === 'refunded' || x.status === 'partially_refunded')) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Υπογραφή για links λήψης: ποιος, ποιο αρχείο, μέχρι πότε.
export async function sign(secret, data) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toB64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
}

// Link λήψης για μία άδεια και ένα αρχείο της (mp3 / wav / stems). Ισχύει `days` μέρες.
export async function downloadLink(env, origin, licenseId, fileKind, days = 30) {
  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const sig = await sign(env.VMT_DOWNLOAD_SECRET, `${licenseId}|${fileKind}|${exp}`);
  return `${origin}/api/vmt-download?l=${encodeURIComponent(licenseId)}&f=${fileKind}&e=${exp}&s=${sig}`;
}

// Ποια αρχεία παίρνει κάθε άδεια.
export const FILES_FOR_LICENSE = { mp3: ['mp3'], wav: ['wav', 'mp3'], stems: ['wav', 'mp3', 'stems'] };
export const FILE_LABEL = { mp3: 'MP3', wav: 'WAV', stems: 'Stems (zip)' };
