// Δωρεάν tagged MP3 για email.
// POST: ο επισκέπτης δίνει email + συγκατάθεση. Μπαίνει στη λίστα (Resend), γράφεται στο
//       vmt_free (Firestore, για να μετράμε πηγές) και του έρχεται email με link λήψης.
// GET:  το link του email. Ελέγχει την υπογραφή και δίνει το tagged MP3 ως κατέβασμα.
import beatsData from '../../src/data/beats.json';
import { slugOf } from '../../src/data/vmtPricing';
import { json, sign, firestoreToken } from '../../src/utils/vmtServer';

const DAYS = 30;
const AUDIENCE = '66d1140c-d7df-4411-aae7-345d9d1432a1';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const beatBySlug = (slug) => beatsData.beatslist.find((b) => slugOf(b.title) === slug && b.status !== 'sold');
const cleanFrom = (s) => String(s || 'site').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30) || 'site';

const TEXT = {
  el: {
    subject: (t) => `${t}: η δωρεάν tagged έκδοση`,
    hi: 'Ορίστε το beat που ζήτησες. Είναι η δωρεάν tagged έκδοση, με το φωνητικό tag.',
    button: 'Κατέβασε το MP3',
    expires: `Το link ισχύει ${DAYS} μέρες.`,
    rulesTitle: 'Πώς το χρησιμοποιείς',
    rules: [
      'Μόνο για μη κερδοσκοπική χρήση: demo, freestyle, πρόβα.',
      'YouTube χωρίς monetization και SoundCloud δωρεάν, ναι.',
      'Δεν επιτρέπεται να το κυκλοφορήσεις σε Spotify, Apple Music ή άλλη πλατφόρμα streaming. Αν το κάνεις, έχουμε το δικαίωμα να το κατεβάσουμε και να κινηθούμε νομικά.',
      'Στα credits γράφεις «prod. vybezmadethis».',
    ],
    paid: 'Θες να το βγάλεις παντού και να κρατάς τα έσοδα; Πάρε άδεια MP3, WAV ή Stems χωρίς tag:',
    paidButton: 'Δες τις άδειες',
    unsub: 'Γράφτηκες για να σου στέλνω νέα beats και προσφορές. Φεύγεις με ένα κλικ από κάθε email.',
  },
  en: {
    subject: (t) => `${t}: your free tagged version`,
    hi: 'Here is the beat you asked for. It is the free tagged version, with the voice tag.',
    button: 'Download the MP3',
    expires: `The link works for ${DAYS} days.`,
    rulesTitle: 'How you can use it',
    rules: [
      'Non profit use only: demos, freestyles, practice.',
      'YouTube without monetization and free SoundCloud uploads are fine.',
      'You may not release it on Spotify, Apple Music or any other streaming platform. If you do, we have the right to take it down and take legal action.',
      'Credit it as "prod. vybezmadethis".',
    ],
    paid: 'Want to release it everywhere and keep the money? Get an MP3, WAV or Stems license without the tag:',
    paidButton: 'See the licenses',
    unsub: 'You signed up for new beats and offers. You can leave with one click from any email.',
  },
};

function mailHtml(t, beat, link, storeUrl) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1a1a">
  <h2 style="margin:0 0 6px">${beat.title}</h2>
  <p>${t.hi}</p>
  <a href="${link}" style="display:inline-block;margin:10px 0;padding:12px 18px;background:#FF6600;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">${t.button}</a>
  <p style="font-size:13px;color:#8A847C">${t.expires}</p>
  <h3 style="margin:22px 0 6px;font-size:15px">${t.rulesTitle}</h3>
  <ul style="font-size:14px;padding-left:18px">${t.rules.map((r) => `<li>${r}</li>`).join('')}</ul>
  <p style="font-size:14px">${t.paid}</p>
  <a href="${storeUrl}" style="display:inline-block;padding:10px 14px;border:1px solid #FF6600;color:#FF6600;border-radius:8px;text-decoration:none;font-weight:700">${t.paidButton}</a>
  <p style="font-size:12px;color:#8A847C;margin-top:24px">${t.unsub}</p>
  <p style="font-size:13px;color:#8A847C">vybezmadethis · The Robe Producer</p></div>`;
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const lang = body.lang === 'en' ? 'en' : 'el';
  const email = String(body.email || '').trim().toLowerCase();
  const slug = String(body.slug || '');
  const from = cleanFrom(body.from);
  if (!EMAIL_RE.test(email) || email.length > 120) return json({ error: lang === 'en' ? 'Check your email.' : 'Έλεγξε το email σου.' }, 400);
  if (body.consent !== true) return json({ error: lang === 'en' ? 'Tick the box first.' : 'Τσέκαρε πρώτα το κουτάκι.' }, 400);
  const beat = beatBySlug(slug);
  if (!beat) return json({ error: lang === 'en' ? 'This beat is not available.' : 'Αυτό το beat δεν είναι διαθέσιμο.' }, 404);

  const origin = new URL(request.url).origin;
  const exp = Math.floor(Date.now() / 1000) + DAYS * 86400;
  const sig = await sign(env.VMT_DOWNLOAD_SECRET, `free|${slug}|${exp}`);
  const link = `${origin}/api/vmt-free?b=${encodeURIComponent(slug)}&e=${exp}&s=${sig}`;
  const storeUrl = `${origin}${lang === 'en' ? '/en' : ''}/beats/${slug}`;
  const t = TEXT[lang];

  const mail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: 'VMT Beats <beats@blackvybez.gr>', reply_to: 'support@blackvybez.gr', to: [email], subject: t.subject(beat.title), html: mailHtml(t, beat, link, storeUrl) }),
  });
  if (!mail.ok) {
    console.error('Resend email failed:', mail.status, await mail.text());
    return json({ error: lang === 'en' ? 'The email did not go out, try again.' : 'Το email δεν έφυγε, δοκίμασε ξανά.' }, 502);
  }

  // Λίστα και μέτρηση: αν κάτι αποτύχει εδώ, ο επισκέπτης έχει ήδη το email του.
  const jobs = [
    fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID || AUDIENCE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({ email, first_name: 'vmt_free', last_name: `${from} ${slug}`.slice(0, 60), unsubscribed: false }),
    }),
    firestoreToken(env).then((token) => fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/vmt_free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fields: {
        email: { stringValue: email },
        beat: { stringValue: slug },
        from: { stringValue: from },
        lang: { stringValue: lang },
        consent: { booleanValue: true },
        at: { timestampValue: new Date().toISOString() },
      } }),
    })),
  ];
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === 'rejected') console.error('vmt-free side job failed:', r.reason);
    else if (!r.value.ok) console.error('vmt-free side job failed:', r.value.status, await r.value.text());
  }
  return json({ ok: true });
}

const fail = (msg, status = 403) => new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const slug = u.searchParams.get('b') || '';
  const e = Number(u.searchParams.get('e') || 0);
  const s = u.searchParams.get('s') || '';
  if (!slug || !e || !s) return fail('Λάθος link.', 400);
  const beatsUrl = `${u.origin}/beats/${encodeURIComponent(slug)}`;
  if (e < Date.now() / 1000) return fail(`Το link έληξε. Ζήτα νέο από τη σελίδα του beat: ${beatsUrl}`, 410);
  const expected = await sign(env.VMT_DOWNLOAD_SECRET, `free|${slug}|${e}`);
  let diff = expected.length ^ s.length;
  for (let i = 0; i < Math.min(expected.length, s.length); i++) diff |= expected.charCodeAt(i) ^ s.charCodeAt(i);
  if (diff !== 0) return fail('Λάθος link.');
  const beat = beatBySlug(slug);
  if (!beat?.audioSrc) return fail('Το beat δεν είναι πια διαθέσιμο.', 404);

  const file = await fetch(beat.audioSrc);
  if (!file.ok) return fail('Το αρχείο δεν βρέθηκε, δοκίμασε σε λίγο.', 502);
  const name = `${beat.title} (prod. vybezmadethis) FREE.mp3`.replace(/["\\/]/g, '');
  return new Response(file.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="free.mp3"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'Cache-Control': 'private, no-store',
    },
  });
}
