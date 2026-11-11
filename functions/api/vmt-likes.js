// «Μου αρέσει» στα beats του VMT.
// GET:  { counts: { slug: n }, mine: [slug] }. Τα counts είναι δημόσια, το mine μόνο με σύνδεση.
// POST: { slug, like: true|false } με σύνδεση. Γράφει users/<uid>/likes/<slug> και αλλάζει
//       τον μετρητή vmt_likes/<slug>.count στο ίδιο commit. Ο έλεγχος «υπάρχει ήδη / δεν υπάρχει»
//       γίνεται από το Firestore, άρα δύο πατήματα δεν μετράνε διπλά.
// Οι πελάτες δεν γράφουν ποτέ απευθείας: τα rules αρνούνται τα πάντα σε αυτές τις συλλογές.
import beatsData from '../../src/data/beats.json';
import { slugOf } from '../../src/data/vmtPricing';
import { json, userFromRequest, firestoreToken } from '../../src/utils/vmtServer';

const SLUGS = new Set(beatsData.beatslist.map((b) => slugOf(b.title)));
const root = (env) => `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const api = (env) => `https://firestore.googleapis.com/v1/${root(env)}`;
const auth = (token) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

async function counts(env, token) {
  const out = {};
  let page = '';
  do {
    const r = await fetch(`${api(env)}/vmt_likes?pageSize=300${page ? `&pageToken=${page}` : ''}`, { headers: auth(token) });
    if (!r.ok) { console.error('vmt-likes counts failed:', r.status, await r.text()); break; }
    const d = await r.json();
    for (const doc of d.documents || []) {
      const n = Number(doc.fields?.count?.integerValue || 0);
      if (n > 0) out[doc.name.split('/').pop()] = n;
    }
    page = d.nextPageToken || '';
  } while (page);
  return out;
}

async function mine(env, token, uid) {
  const r = await fetch(`${api(env)}/users/${uid}/likes?pageSize=300`, { headers: auth(token) });
  if (!r.ok) return [];
  const d = await r.json();
  return (d.documents || [])
    .map((doc) => ({ slug: doc.name.split('/').pop(), at: doc.fields?.at?.timestampValue || '' }))
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .map((x) => x.slug);
}

export async function onRequestGet({ request, env }) {
  const token = await firestoreToken(env);
  const user = await userFromRequest(request, env);
  const [c, m] = await Promise.all([counts(env, token), user ? mine(env, token, user.user_id || user.sub) : []]);
  return json({ counts: c, mine: m });
}

export async function onRequestPost({ request, env }) {
  try { return await post(request, env); } catch (e) { console.error('vmt-likes crash:', e?.stack || e); return json({ error: 'crash', detail: String(e?.message || e) }, 500); }
}

async function post(request, env) {
  const user = await userFromRequest(request, env);
  if (!user) { console.error('vmt-likes: no valid token'); return json({ error: 'login' }, 401); }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const slug = String(body.slug || '');
  const like = body.like === true;
  if (!SLUGS.has(slug)) return json({ error: 'unknown beat' }, 404);

  const uid = user.user_id || user.sub;
  const token = await firestoreToken(env);
  const likeDoc = `${root(env)}/users/${uid}/likes/${slug}`;
  const counter = {
    transform: {
      document: `${root(env)}/vmt_likes/${slug}`,
      fieldTransforms: [
        { fieldPath: 'count', increment: { integerValue: like ? '1' : '-1' } },
        { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
      ],
    },
  };
  const own = like
    ? { update: { name: likeDoc, fields: { at: { timestampValue: new Date().toISOString() } } }, currentDocument: { exists: false } }
    : { delete: likeDoc, currentDocument: { exists: true } };

  const r = await fetch(`https://firestore.googleapis.com/v1/${root(env)}:commit`, {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({ writes: [own, counter] }),
  });
  // Αποτυχία προϋπόθεσης = ήταν ήδη έτσι. Δεν αλλάζει τίποτα, δεν είναι λάθος.
  if (!r.ok) {
    const text = await r.text();
    if (!/FAILED_PRECONDITION|ALREADY_EXISTS|NOT_FOUND/.test(text)) {
      console.error('vmt-likes commit failed:', r.status, text);
      return json({ error: 'save failed', status: r.status, detail: text.slice(0, 300) }, 502);
    }
  }
  const c = await fetch(`${api(env)}/vmt_likes/${slug}`, { headers: auth(token) });
  const count = c.ok ? Number((await c.json()).fields?.count?.integerValue || 0) : null;
  return json({ ok: true, liked: like, count: Math.max(0, count ?? 0) });
}
