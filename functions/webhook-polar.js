// Polar purchase webhook (beat store του vybezmadethis).
//
// Στο `order.paid`: ελέγχει ότι το αίτημα ήρθε από το Polar (Standard Webhooks
// υπογραφή), γράφει την άδεια στη λίστα αδειών (vmt_licenses, για τις
// υπενθυμίσεις λήξης και το Κέντρο) και, αν ο αγοραστής έχει account στο
// site με το ίδιο email, προσθέτει την αγορά εκεί όπως κάνει το webhook-ls.
//
// Cloudflare Pages env vars (ποτέ στο repo):
//   POLAR_WEBHOOK_SECRET   - το secret του webhook στο Polar
//   POLAR_TOKEN            - για τους προσωπικούς κωδικούς VIP
//   FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY

import { tierForPurchases } from '../src/data/loyaltyTiers';
import { getGoogleAccessToken } from '../src/utils/firebaseAdmin';

const MP3_DAYS = 365;

async function verifySignature(request, rawBody, secret) {
  const id = request.headers.get('webhook-id');
  const ts = request.headers.get('webhook-timestamp');
  const sigHeader = request.headers.get('webhook-signature') || '';
  if (!id || !ts) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false; // παλιό ή ξαναπαιγμένο αίτημα
  const enc = new TextEncoder();
  // «whsec_...» = Standard Webhooks (το κλειδί είναι το base64 μετά το πρόθεμα). Αλλιώς το secret ως έχει.
  const keys = [enc.encode(secret)];
  if (secret.startsWith('whsec_')) keys.unshift(Uint8Array.from(atob(secret.slice(6)), (c) => c.charCodeAt(0)));
  const expectedAll = [];
  for (const raw of keys) {
    const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${id}.${ts}.${rawBody}`));
    expectedAll.push(btoa(String.fromCharCode(...new Uint8Array(sig))));
  }
  return expectedAll.some((expected) => sigHeader.split(' ').some((part) => {
    const [, value] = part.split(',');
    if (!value || value.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < value.length; i++) diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  }));
}

const fsBase = (env) => `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const authJson = (token) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

async function findUserByEmail(env, token, email) {
  const res = await fetch(`${fsBase(env)}:runQuery`, {
    method: 'POST',
    headers: authJson(token),
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: email } } },
        limit: 1,
      },
    }),
  });
  const results = await res.json();
  const match = Array.isArray(results) ? results.find((r) => r.document) : null;
  return match?.document || null;
}

// Μία εγγραφή ανά παραγγελία (doc id = order id), άρα ένα retry του Polar δεν τη διπλασιάζει.
async function saveLicense(env, token, orderId, fields) {
  const res = await fetch(`${fsBase(env)}/vmt_licenses?documentId=${encodeURIComponent(orderId)}`, {
    method: 'POST',
    headers: authJson(token),
    body: JSON.stringify({ fields }),
  });
  if (res.status === 409) return false; // υπάρχει ήδη
  if (!res.ok) throw new Error(`vmt_licenses write failed: ${res.status} ${await res.text()}`);
  return true;
}

async function appendPurchase(env, token, docName, p) {
  const fields = {
    orderId: { stringValue: p.orderId },
    product: { stringValue: p.product },
    amount: { doubleValue: p.amount },
    createdAt: { stringValue: p.createdAt },
    source: { stringValue: 'polar' },
    license: { stringValue: p.license },
  };
  if (p.expiresAt) fields.expiresAt = { stringValue: p.expiresAt };
  const res = await fetch(`${fsBase(env)}:commit`, {
    method: 'POST',
    headers: authJson(token),
    body: JSON.stringify({
      writes: [{
        transform: {
          document: docName,
          fieldTransforms: [{ fieldPath: 'purchases', appendMissingElements: { values: [{ mapValue: { fields } }] } }],
        },
      }],
    }),
  });
  if (!res.ok) throw new Error(`Firestore commit failed: ${res.status} ${await res.text()}`);
}

async function setUserFields(token, docName, fields) {
  const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${k}`).join('&');
  const res = await fetch(`https://firestore.googleapis.com/v1/${docName}?${mask}`, {
    method: 'PATCH',
    headers: authJson(token),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Firestore field update failed: ${res.status} ${await res.text()}`);
}

function randomCodeSuffix() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [...crypto.getRandomValues(new Uint8Array(6))].map((b) => alphabet[b % alphabet.length]).join('');
}

// Προσωπικός κωδικός VIP στο Polar (ίδια λογική με το webhook-ls).
async function createPolarDiscount(polarToken, tier, email) {
  const code = `VIP${tier.name.toUpperCase()}${randomCodeSuffix()}`;
  const res = await fetch('https://api.polar.sh/v1/discounts/', {
    method: 'POST',
    headers: authJson(polarToken),
    body: JSON.stringify({ name: `VIP ${tier.name}, ${email}`, code, type: 'percentage', basis_points: tier.percent * 100, duration: 'once' }),
  });
  if (!res.ok) throw new Error(`Polar discount failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  return code;
}

export async function onRequestPost({ request, env }) {
  if (!env.POLAR_WEBHOOK_SECRET) return new Response('Server misconfigured', { status: 500 });
  const rawBody = await request.text();
  if (!(await verifySignature(request, rawBody, env.POLAR_WEBHOOK_SECRET))) {
    return new Response('Invalid signature', { status: 401 });
  }

  let payload;
  try { payload = JSON.parse(rawBody); } catch { return new Response('Bad JSON', { status: 400 }); }
  if (payload.type !== 'order.paid') return new Response('Ignored', { status: 202 });

  const o = payload.data || {};
  const email = (o.customer?.email || '').toLowerCase();
  const meta = o.product?.metadata || {};
  const license = meta.license || '';
  const beat = meta.beat || (o.product?.name || '').split(' · ')[0];
  const createdAt = o.created_at || new Date().toISOString();
  const expiresAt = license === 'MP3'
    ? new Date(new Date(createdAt).getTime() + MP3_DAYS * 864e5).toISOString()
    : '';
  if (!email) return new Response('No email', { status: 202 });

  try {
    const token = await getGoogleAccessToken(env);
    const isNew = await saveLicense(env, token, String(o.id), {
      email: { stringValue: email },
      beat: { stringValue: beat },
      license: { stringValue: license },
      amount: { doubleValue: (o.total_amount ?? 0) / 100 },
      createdAt: { stringValue: createdAt },
      expiresAt: { stringValue: expiresAt },
      productId: { stringValue: o.product_id || '' },
      reminded: { booleanValue: false },
    });
    if (!isNew) return new Response('Already recorded', { status: 202 });

    const userDoc = await findUserByEmail(env, token, email);
    if (!userDoc) return new Response('Recorded, no site account', { status: 202 });

    await appendPurchase(env, token, userDoc.name, {
      orderId: String(o.id),
      product: o.product?.name || beat,
      amount: (o.total_amount ?? 0) / 100,
      createdAt,
      license,
      expiresAt,
    });

    const newCount = (userDoc.fields?.purchases?.arrayValue?.values || []).length + 1;
    const { tier } = tierForPurchases(newCount);
    if (tier.percent > 0 && userDoc.fields?.vipTier?.stringValue !== tier.key && env.POLAR_TOKEN) {
      try {
        const code = await createPolarDiscount(env.POLAR_TOKEN, tier, email);
        await setUserFields(token, userDoc.name, { vipCode: { stringValue: code }, vipTier: { stringValue: tier.key } });
      } catch (e) {
        console.error('VIP code failed (purchase still recorded):', e);
      }
    }
    return new Response('OK', { status: 202 });
  } catch (err) {
    console.error('Polar webhook error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
