// Λήψη αρχείου άδειας: ελέγχει την υπογραφή του link, βρίσκει την άδεια και στέλνει τον
// πελάτη σε προσωρινό link του R2 (ισχύει 1 ώρα). Το καθαρό αρχείο δεν είναι ποτέ δημόσιο.
import beatsData from '../../src/data/beats.json';
import { slugOf } from '../../src/data/vmtPricing';
import { sign, firestoreToken, FILES_FOR_LICENSE } from '../../src/utils/vmtServer';

const ACCOUNT = 'f7d28ec453b9575198167b587adcb84b';
const BUCKET = 'vmt-files';
const EXT = { mp3: 'mp3', wav: 'wav', stems: 'zip' };

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
const hmac = async (key, s) => crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(s));
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

// AWS SigV4 presigned GET για το R2 (S3 API).
async function presign(env, key, filename, seconds = 3600) {
  const host = `${ACCOUNT}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const day = amzDate.slice(0, 8);
  const scope = `${day}/auto/s3/aws4_request`;
  const path = `/${BUCKET}/${key.split('/').map(enc).join('/')}`;
  const params = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${env.R2_VMT_KEY_ID}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(seconds),
    'X-Amz-SignedHeaders': 'host',
    'response-content-disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
  };
  const qs = Object.keys(params).sort().map((k) => `${enc(k)}=${enc(params[k])}`).join('&');
  const canonical = `GET\n${path}\n${qs}\nhost:${host}\n\nhost\nUNSIGNED-PAYLOAD`;
  const toSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${await sha256(canonical)}`;
  let k = await hmac(new TextEncoder().encode(`AWS4${env.R2_VMT_SECRET}`), day);
  for (const part of ['auto', 's3', 'aws4_request']) k = await hmac(k, part);
  const signature = hex(await hmac(k, toSign));
  return `https://${host}${path}?${qs}&X-Amz-Signature=${signature}`;
}

const fail = (msg, status = 403) => new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const l = u.searchParams.get('l') || '';
  const f = u.searchParams.get('f') || '';
  const e = Number(u.searchParams.get('e') || 0);
  const s = u.searchParams.get('s') || '';
  if (!l || !f || !e || !s) return fail('Λάθος link.', 400);
  if (e < Date.now() / 1000) return fail('Το link έληξε. Μπες στο account σου στο blackvybez.gr για νέο link λήψης.', 410);
  const expected = await sign(env.VMT_DOWNLOAD_SECRET, `${l}|${f}|${e}`);
  let diff = expected.length ^ s.length;
  for (let i = 0; i < Math.min(expected.length, s.length); i++) diff |= expected.charCodeAt(i) ^ s.charCodeAt(i);
  if (diff !== 0) return fail('Λάθος link.');

  const token = await firestoreToken(env);
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/vmt_licenses/${encodeURIComponent(l)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return fail('Η άδεια δεν βρέθηκε.', 404);
  const fields = (await r.json()).fields || {};
  const beatTitle = fields.beat?.stringValue || '';
  const lic = (fields.license?.stringValue || '').toLowerCase();
  const slug = fields.slug?.stringValue || slugOf(beatTitle);
  const expiresAt = fields.expiresAt?.stringValue;
  if (expiresAt && new Date(expiresAt) < new Date()) return fail('Η άδεια MP3 έληξε. Ανανέωσέ την ή πάρε τον WAV στο blackvybez.gr/beats.', 410);
  if (!(FILES_FOR_LICENSE[lic] || []).includes(f)) return fail('Αυτό το αρχείο δεν ανήκει στην άδειά σου.');

  const beat = (beatsData.beatslist || []).find((b) => slugOf(b.title) === slug);
  const key = beat?.files?.[f];
  if (!key) return fail('Το αρχείο δεν είναι διαθέσιμο ακόμα. Γράψε μας και σου το στέλνουμε.', 404);

  const name = `Vybezmadethis - ${beat.title} (${f === 'stems' ? 'Stems' : f.toUpperCase()}).${EXT[f]}`;
  return Response.redirect(await presign(env, key, name), 302);
}
