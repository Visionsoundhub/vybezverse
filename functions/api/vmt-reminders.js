// Αυτόματα email του VMT store. Τρέχει μία φορά τη μέρα από τον worker «vmt-cron» (Cloudflare cron),
// που στέλνει το header X-Cron-Secret. Τρία είδη email, το καθένα μία φορά ανά άδεια:
//   1. stems: την 6η μέρα «αύριο ανεβαίνει η τιμή», την 29η μέρα «τελευταία μέρα»
//   2. MP3: 30 μέρες πριν λήξει
// Στη συλλογή vmt_licenses κρατάμε ποιο email έφυγε (stemsMail7, stemsMail30, reminded).
import { afterOffers, beatBySlug, euro } from '../../src/data/vmtPricing';
import { firestoreToken } from '../../src/utils/vmtServer';

const DAY = 864e5;
const fsBase = (env) => `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function allLicenses(env, token) {
  const out = [];
  let page = '';
  do {
    const r = await fetch(`${fsBase(env)}/vmt_licenses?pageSize=300${page ? `&pageToken=${page}` : ''}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    for (const doc of d.documents || []) {
      const f = doc.fields || {};
      const v = (k) => f[k]?.stringValue ?? '';
      out.push({
        name: doc.name, id: doc.name.split('/').pop(), email: v('email'), beat: v('beat'), slug: v('slug'),
        license: v('license'), createdAt: v('createdAt'), expiresAt: v('expiresAt'),
        reminded: !!f.reminded?.booleanValue, stemsMail7: !!f.stemsMail7?.booleanValue, stemsMail30: !!f.stemsMail30?.booleanValue,
      });
    }
    page = d.nextPageToken || '';
  } while (page);
  return out;
}

async function mark(token, name, field) {
  await fetch(`https://firestore.googleapis.com/v1/${name}?updateMask.fieldPaths=${field}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fields: { [field]: { booleanValue: true } } }),
  });
}

async function send(env, to, subject, title, body, origin, cta) {
  const html = `<div style="background:#141210;color:#F4F1EC;padding:28px;font-family:Arial,sans-serif;line-height:1.5">
  <p style="color:#FF6600;letter-spacing:2px;font-size:12px;margin:0">VMT BEATS</p>
  <h1 style="margin:6px 0 16px;font-size:24px">${esc(title)}</h1>
  ${body}
  <a href="${origin}/beats" style="display:inline-block;margin:18px 0;padding:12px 18px;background:#FF6600;color:#000;border-radius:8px;text-decoration:none;font-weight:700">${esc(cta)}</a>
  <p style="font-size:13px;color:#8A847C">Το βρίσκεις στο «Τα beats μου», πάνω δεξιά στο blackvybez.gr/beats.<br>vybezmadethis · The Robe Producer</p></div>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: 'VMT Beats <beats@blackvybez.gr>', reply_to: 'support@blackvybez.gr', to: [to], subject, html }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status} ${await r.text()}`);
}

export async function onRequestPost({ request, env }) {
  const secret = request.headers.get('X-Cron-Secret') || '';
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) return new Response('forbidden', { status: 403 });
  const dry = new URL(request.url).searchParams.get('dry') === '1';
  const origin = 'https://blackvybez.gr';
  const now = Date.now();
  const token = await firestoreToken(env);
  const sent = [];

  for (const l of await allLicenses(env, token)) {
    if (!l.email) continue;
    const lic = l.license.toLowerCase();
    const age = (now - new Date(l.createdAt).getTime()) / DAY;

    // 1. Stems: λίγο πριν ανέβει η τιμή
    const stems = afterOffers(l, new Date(now)).find((o) => o.kind === 'stems');
    if (stems && stems.off > 0 && beatBySlug(l.slug)?.files?.stems) {
      const step = age >= 6 && age < 7 ? 'stemsMail7' : age >= 29 && age < 30 ? 'stemsMail30' : null;
      if (step && !l[step]) {
        const last = step === 'stemsMail30';
        const subject = last ? `Τελευταία μέρα: τα stems του ${l.beat} με ${euro(stems.price)}` : `Αύριο ανεβαίνει η τιμή για τα stems του ${l.beat}`;
        const body = `<p>Έχεις το <strong>${esc(l.beat)}</strong> σε ${esc(l.license)}. Τα stems (όλα τα κανάλια ξεχωριστά, για τη μίξη σου) τα παίρνεις τώρα με <strong>${euro(stems.price)}</strong> αντί για ${euro(stems.full)}.</p>
        <p>${last ? 'Από αύριο πληρώνεις την κανονική διαφορά.' : 'Από αύριο η τιμή ανεβαίνει.'}</p>`;
        if (!dry) { await send(env, l.email, subject, last ? 'Τελευταία μέρα για τα stems' : 'Αύριο ανεβαίνει η τιμή', body, origin, 'Πάρε τα stems'); await mark(token, l.name, step); }
        sent.push(`${step} ${l.email} ${l.beat}`);
      }
    }

    // 2. MP3: 30 μέρες πριν τη λήξη
    if (lic === 'mp3' && l.expiresAt && !l.reminded) {
      const left = (new Date(l.expiresAt).getTime() - now) / DAY;
      if (left <= 30 && left > 0) {
        const subject = `Η άδεια MP3 του ${l.beat} λήγει σε ${Math.ceil(left)} μέρες`;
        const body = `<p>Η άδεια MP3 για το <strong>${esc(l.beat)}</strong> λήγει στις ${new Date(l.expiresAt).toLocaleDateString('el-GR', { timeZone: 'Europe/Athens' })}.</p>
        <p>Δύο επιλογές: <strong>ανανέωση για 1 χρόνο με 5€</strong>, ή <strong>WAV για πάντα με 9,99€</strong> και δεν ξανασχολείσαι.</p>`;
        if (!dry) { await send(env, l.email, subject, 'Λήγει η άδεια MP3', body, origin, 'Ανανέωση ή WAV'); await mark(token, l.name, 'reminded'); }
        sent.push(`mp3 ${l.email} ${l.beat}`);
      }
    }
  }
  return new Response(JSON.stringify({ dry, sent }), { headers: { 'Content-Type': 'application/json' } });
}
