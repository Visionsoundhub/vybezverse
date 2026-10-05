// Οι άδειες beats (από το Polar) του συνδεδεμένου χρήστη, με βάση το email του.
// Έτσι βλέπει τις αγορές του στο account ακόμα κι αν αγόρασε πριν φτιάξει account,
// ή με email και κωδικό αντί για Google. Ο χρήστης στέλνει το Firebase ID token του.
import { getGoogleAccessToken } from '../../src/utils/firebaseAdmin';
import { downloadLink, FILES_FOR_LICENSE, FILE_LABEL, noPaidPolarOrders } from '../../src/utils/vmtServer';
import { firstOrderActive } from '../../src/data/vmtPricing';

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
        slug: v('slug'),
        source: 'polar',
      };
    });
  // Links λήψης (ισχύουν 1 μέρα, φτιάχνονται ξανά κάθε φορά που ανοίγει το account).
  const origin = new URL(request.url).origin;
  if (env.VMT_DOWNLOAD_SECRET) {
    for (const l of licenses) {
      if (l.expiresAt && new Date(l.expiresAt) < new Date()) { l.downloads = []; l.expired = true; continue; }
      const files = FILES_FOR_LICENSE[(l.license || '').toLowerCase()] || [];
      l.downloads = [];
      for (const f of files) l.downloads.push({ label: FILE_LABEL[f], url: await downloadLink(env, origin, l.orderId, f, 1) });
      l.pdf = await downloadLink(env, origin, l.orderId, 'pdf', 1);
    }
  }

  // Η έκπτωση VIP μπαίνει πλέον μόνη της στο καλάθι, δεν υπάρχουν κωδικοί.
  const firstEligible = licenses.length === 0 && firstOrderActive() ? await noPaidPolarOrders(env, user.email.toLowerCase()) : false;
  return json({ licenses, vipCode: null, vipTier: null, firstEligible });
}
