// Shared Firebase Admin-style REST helpers for Cloudflare Pages Functions.
//
// Functions run on the Workers runtime, which has no Node "firebase-admin"
// SDK available, so this signs a service-account JWT with the Web Crypto
// API and talks to the Firestore REST API directly instead. Used by every
// Function that needs server-side (rules-bypassing) Firestore access:
// webhook-ls.js (purchases, VIP codes) and api/blog-publish.js (ALICE posts).
//
// Needs these env vars wherever it's used (Cloudflare Pages -> Settings ->
// Environment variables, never in the repo):
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function b64url(input) {
  const str = typeof input === 'string' ? input : String.fromCharCode(...new Uint8Array(input));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function getGoogleAccessToken(env, scope = 'https://www.googleapis.com/auth/datastore') {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.FIREBASE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(sigBuf)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Google token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

function docPath(env, collection, docId) {
  return `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
}

// Converts a plain JS object (strings/numbers/booleans/arrays of strings)
// into Firestore's typed field format. Deliberately narrow - only the
// shapes blog-publish.js and webhook-ls.js actually send.
export function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') fields[key] = { stringValue: value };
    else if (typeof value === 'number') fields[key] = { doubleValue: value };
    else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    else if (Array.isArray(value)) {
      fields[key] = { arrayValue: { values: value.map((v) => ({ stringValue: String(v) })) } };
    } else {
      fields[key] = { stringValue: String(value) };
    }
  }
  return fields;
}

// Full-replace write (like Firestore's `set`). Creates the doc if absent.
export async function firestoreSet(env, accessToken, collection, docId, plainFields) {
  const res = await fetch(docPath(env, collection, docId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ fields: toFirestoreFields(plainFields) }),
  });
  if (!res.ok) throw new Error(`Firestore set failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function firestoreGet(env, accessToken, collection, docId) {
  const res = await fetch(docPath(env, collection, docId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore get failed: ${res.status} ${await res.text()}`);
  return res.json();
}
