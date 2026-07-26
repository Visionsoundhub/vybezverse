// Lemon Squeezy purchase webhook.
//
// On `order_created`, verifies the request came from Lemon Squeezy (HMAC over
// the raw body), then finds the buyer's Firestore account by email and
// records the purchase, so the loyalty tier bar reflects real purchases.
//
// Requires these Cloudflare Pages env vars (Settings -> Environment variables,
// never in the repo):
//   LEMONSQUEEZY_WEBHOOK_SECRET  - the "Signing secret" from the LS webhook
//   FIREBASE_PROJECT_ID          - from the service account JSON
//   FIREBASE_CLIENT_EMAIL        - from the service account JSON
//   FIREBASE_PRIVATE_KEY         - the "private_key" field, as-is (with \n's)
//   lemon_api_key                - Lemon Squeezy API key, used to mint the
//                                  customer's personal VIP discount code

import { tierForPurchases } from '../src/data/loyaltyTiers';

async function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const hex = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  return diff === 0;
}

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

async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
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

async function findUserByEmail(env, accessToken, email) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'email' },
          op: 'EQUAL',
          value: { stringValue: email },
        },
      },
      limit: 1,
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  const results = await res.json();
  const match = Array.isArray(results) ? results.find((r) => r.document) : null;
  return match?.document || null;
}

async function appendPurchase(env, accessToken, docName, purchase) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`;
  const body = {
    writes: [
      {
        transform: {
          document: docName,
          fieldTransforms: [
            {
              fieldPath: 'purchases',
              appendMissingElements: {
                values: [
                  {
                    mapValue: {
                      fields: {
                        orderId: { stringValue: purchase.orderId },
                        product: { stringValue: purchase.product },
                        amount: { doubleValue: purchase.amount },
                        createdAt: { stringValue: purchase.createdAt },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Firestore commit failed: ${res.status} ${await res.text()}`);
  }
}

// Writes plain top-level fields on a user document. Used for the VIP code,
// which the client is not allowed to write itself (see firestore.rules).
async function setUserFields(env, accessToken, docName, fields) {
  const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${k}`).join('&');
  const url = `https://firestore.googleapis.com/v1/${docName}?${mask}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Firestore field update failed: ${res.status} ${await res.text()}`);
}

const LS_HEADERS = (key) => ({
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
  Authorization: `Bearer ${key}`,
});

// Lemon Squeezy only accepts uppercase letters and digits in a code.
function randomCodeSuffix() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1, easier to retype
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
}

// Mints a discount code that belongs to one customer. Lemon Squeezy has no
// "restrict to this buyer" flag, so uniqueness is what makes a leak
// containable: the code is tied to a known user and can be revoked alone.
async function createPersonalDiscount(apiKey, tier, email) {
  const storesRes = await fetch('https://api.lemonsqueezy.com/v1/stores', { headers: LS_HEADERS(apiKey) });
  const stores = await storesRes.json();
  const storeId = stores?.data?.[0]?.id;
  if (!storeId) throw new Error(`Could not resolve Lemon Squeezy store: ${JSON.stringify(stores).slice(0, 200)}`);

  const code = `VIP${tier.name.toUpperCase()}${randomCodeSuffix()}`;
  const res = await fetch('https://api.lemonsqueezy.com/v1/discounts', {
    method: 'POST',
    headers: LS_HEADERS(apiKey),
    body: JSON.stringify({
      data: {
        type: 'discounts',
        attributes: {
          name: `VIP ${tier.name} — ${email}`,
          code,
          amount: tier.percent,
          amount_type: 'percent',
        },
        relationships: { store: { data: { type: 'stores', id: String(storeId) } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`Discount creation failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  return code;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const lsApiKey = env.LEMONSQUEEZY_API_KEY || env.lemon_api_key;

  if (!env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set');
    return new Response('Server misconfigured', { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature') || '';

  const valid = await verifySignature(rawBody, signature, env.LEMONSQUEEZY_WEBHOOK_SECRET);
  if (!valid) {
    return new Response('Invalid signature', { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  if (payload.meta?.event_name !== 'order_created') {
    return new Response('Ignored', { status: 200 });
  }

  const attrs = payload.data?.attributes;
  const email = attrs?.user_email;
  if (!email) {
    return new Response('No email on order', { status: 200 });
  }

  try {
    const accessToken = await getGoogleAccessToken(env);
    const userDoc = await findUserByEmail(env, accessToken, email);

    if (!userDoc) {
      console.log(`No matching Black Vybez account for ${email}; order not credited to loyalty bar.`);
      return new Response('No matching user', { status: 200 });
    }

    const alreadyRecorded = (userDoc.fields?.purchases?.arrayValue?.values || [])
      .some((v) => v.mapValue?.fields?.orderId?.stringValue === String(payload.data.id));

    if (alreadyRecorded) {
      // Lemon Squeezy retries a webhook until it gets a 2xx, so the same
      // order can arrive more than once. Counting it twice would hand out
      // tiers that were not earned.
      console.log(`Order ${payload.data.id} already recorded for ${email}; skipping.`);
      return new Response('Already recorded', { status: 200 });
    }

    await appendPurchase(env, accessToken, userDoc.name, {
      orderId: String(payload.data.id),
      product: attrs.first_order_item?.product_name || 'Unknown',
      amount: (attrs.total ?? 0) / 100,
      createdAt: attrs.created_at || new Date().toISOString(),
    });

    // Tier is based on the count *after* this purchase.
    const newCount = (userDoc.fields?.purchases?.arrayValue?.values || []).length + 1;
    const { tier } = tierForPurchases(newCount);
    const currentVipTier = userDoc.fields?.vipTier?.stringValue || null;

    if (tier.percent > 0 && currentVipTier !== tier.key) {
      if (!lsApiKey) {
        console.error('No Lemon Squeezy API key set; cannot mint VIP code for', email);
      } else {
        // A failure here must not fail the webhook: the purchase itself is
        // already recorded, and a retry would then double-count it.
        try {
          const code = await createPersonalDiscount(lsApiKey, tier, email);
          await setUserFields(env, accessToken, userDoc.name, {
            vipCode: { stringValue: code },
            vipTier: { stringValue: tier.key },
          });
          console.log(`Minted ${tier.name} code for ${email}`);
        } catch (codeErr) {
          console.error('VIP code minting failed (purchase still recorded):', codeErr);
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('LS webhook processing error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
