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
import { beatBySlug, LICENSE_PRICES, LICENSE_NAMES, slugOf } from '../src/data/vmtPricing';
import { downloadLink, FILES_FOR_LICENSE, FILE_LABEL } from '../src/utils/vmtServer';

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

// Ποιες άδειες περιέχει η παραγγελία: ένα προϊόν ανά beat (παλιός τρόπος) ή καλάθι (metadata.items).
function itemsOf(o) {
  const total = (o.total_amount ?? 0) / 100;
  const meta = o.metadata || {};
  if (meta.kind === 'cart' && meta.items) {
    const raw = String(meta.items).split(',').map((x) => {
      const [slug, lic, free] = x.split(':');
      const beat = beatBySlug(slug);
      return { slug, beat: beat?.title || slug, license: LICENSE_NAMES[lic] || lic, price: free === '1' ? 0 : LICENSE_PRICES[lic] || 0 };
    });
    const sum = raw.reduce((a, r) => a + r.price, 0) || 1;
    const totalCents = Math.round(total * 100);
    let given = 0;
    return raw.map((r, i) => {
      const cents = i === raw.length - 1 ? totalCents - given : Math.round((totalCents * r.price) / sum);
      given += cents;
      return { id: `${o.id}-${i}`, ...r, amount: cents / 100 };
    });
  }
  const pm = o.product?.metadata || {};
  const beat = pm.beat || (o.product?.name || '').split(' · ')[0];
  return [{ id: String(o.id), slug: slugOf(beat), beat, license: pm.license || '', amount: total }];
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Ελληνικό email με τα links λήψης (μέσω Resend, από το blackvybez.gr).
async function sendFilesEmail(env, origin, email, items, heading = 'Είναι δικά σου') {
  if (!env.RESEND_API_KEY) return;
  const blocks = [];
  for (const it of items) {
    const files = FILES_FOR_LICENSE[it.license.toLowerCase()] || [];
    const links = [];
    for (const f of files) links.push(`<a href="${await downloadLink(env, origin, it.id, f)}" style="display:inline-block;margin:4px 8px 4px 0;padding:10px 14px;background:#FF6600;color:#000;border-radius:8px;text-decoration:none;font-weight:700">${FILE_LABEL[f]}</a>`);
    links.push(`<a href="${await downloadLink(env, origin, it.id, 'pdf')}" style="display:inline-block;margin:4px 8px 4px 0;padding:10px 14px;border:1px solid #FF6600;color:#FF6600;border-radius:8px;text-decoration:none;font-weight:700">Άδεια PDF</a>`);
    const exp = it.expiresAt ? `<br><span style="color:#8A847C;font-size:13px">Η άδεια MP3 ισχύει έναν χρόνο, μέχρι ${new Date(it.expiresAt).toLocaleDateString('el-GR')}.</span>` : '';
    blocks.push(`<div style="margin:0 0 22px"><strong style="font-size:18px">${esc(it.beat)}</strong> · ${esc(it.license)}<br>${links.join('')}${exp}</div>`);
  }
  const html = `<div style="background:#141210;color:#F4F1EC;padding:28px;font-family:Arial,sans-serif;line-height:1.5">
  <p style="color:#FF6600;letter-spacing:2px;font-size:12px;margin:0">VMT BEATS</p>
  <h1 style="margin:6px 0 16px;font-size:26px">${esc(heading)}</h1>
  <p>Ευχαριστώ για την αγορά. Πάτα για να κατεβάσεις τα αρχεία σου, χωρίς tag:</p>
  ${blocks.join('')}
  <p style="font-size:14px">Ανεβάζεις το κομμάτι σου σε Spotify, YouTube και παντού και κρατάς τα έσοδα. Στα credits γράφεις «prod. vybezmadethis».</p>
  <div style="margin:22px 0;padding:16px;border:2px solid #FF6600;border-radius:12px">
    <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#FF6600">Τα links λήψης λήγουν σε 30 μέρες</p>
    <p style="margin:0 0 12px;font-size:14px">Κατέβασέ τα τώρα. Μετά τα βρίσκεις όποτε θες στο account σου στο blackvybez.gr, στο «Τα Beats μου». Αν δεν έχεις account, φτιάξε ένα με αυτό εδώ το email και τα beats σου εμφανίζονται μόνα τους.</p>
    <a href="${origin}/account" style="display:inline-block;padding:10px 14px;border:1px solid #FF6600;color:#FF6600;border-radius:8px;text-decoration:none;font-weight:700">Τα beats μου στο site</a>
  </div>
  <p style="font-size:13px;color:#8A847C">vybezmadethis · The Robe Producer</p></div>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    // Οι απαντήσεις του πελάτη πάνε στο support@blackvybez.gr (routing Cloudflare προς το Gmail).
    body: JSON.stringify({ from: 'VMT Beats <beats@blackvybez.gr>', reply_to: 'support@blackvybez.gr', bcc: ['support@blackvybez.gr'], to: [email], subject: `Τα beats σου είναι έτοιμα: ${items.map((i) => i.beat).join(', ')}`, html }),
  });
  if (!r.ok) console.error('Resend failed:', r.status, await r.text());
}

// Ανανέωση / WAV / stems σε άδεια που υπάρχει. Μία φορά ανά παραγγελία (vmt_upgrades/<order id>).
async function applyUpgrade(env, origin, o, email) {
  const meta = o.metadata || {};
  const token = await getGoogleAccessToken(env);
  const isNew = await fetch(`${fsBase(env)}/vmt_upgrades?documentId=${encodeURIComponent(String(o.id))}`, {
    method: 'POST',
    headers: authJson(token),
    body: JSON.stringify({ fields: {
      license: { stringValue: String(meta.license || '') },
      to: { stringValue: String(meta.to || '') },
      email: { stringValue: email },
      amount: { doubleValue: (o.total_amount ?? 0) / 100 },
      createdAt: { stringValue: o.created_at || new Date().toISOString() },
    } }),
  });
  if (isNew.status === 409) return new Response('Already applied', { status: 202 });
  if (!isNew.ok) throw new Error(`vmt_upgrades write failed: ${isNew.status} ${await isNew.text()}`);

  const docUrl = `${fsBase(env)}/vmt_licenses/${encodeURIComponent(String(meta.license || ''))}`;
  const cur = await fetch(docUrl, { headers: authJson(token) });
  if (!cur.ok) throw new Error(`license not found: ${meta.license}`);
  const f = (await cur.json()).fields || {};
  if ((f.email?.stringValue || '') !== email) throw new Error('upgrade email mismatch');

  let fields;
  if (meta.to === 'renew') {
    const base = Math.max(Date.now(), new Date(f.expiresAt?.stringValue || 0).getTime());
    fields = { expiresAt: { stringValue: new Date(base + MP3_DAYS * 864e5).toISOString() }, reminded: { booleanValue: false } };
  } else if (meta.to === 'wav' || meta.to === 'stems') {
    fields = { license: { stringValue: meta.to === 'wav' ? 'WAV' : 'Stems' }, expiresAt: { stringValue: '' } };
  } else {
    return new Response('Unknown upgrade', { status: 202 });
  }
  const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${k}`).join('&');
  const up = await fetch(`${docUrl}?${mask}`, { method: 'PATCH', headers: authJson(token), body: JSON.stringify({ fields }) });
  if (!up.ok) throw new Error(`license update failed: ${up.status} ${await up.text()}`);

  const it = {
    id: String(meta.license),
    beat: f.beat?.stringValue || '',
    license: fields.license?.stringValue || f.license?.stringValue || 'MP3',
    expiresAt: fields.expiresAt.stringValue,
  };
  try {
    await sendFilesEmail(env, origin, email, [it], meta.to === 'renew' ? 'Η άδεια ανανεώθηκε' : 'Τα νέα αρχεία σου');
  } catch (e) {
    console.error('Upgrade email failed:', e);
  }
  return new Response('Upgraded', { status: 202 });
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
  // Μόνο παραγγελίες του VMT (καλάθι ή προϊόν beat). Ό,τι άλλο πουληθεί από τον ίδιο λογαριασμό Polar αγνοείται.
  if (o.metadata?.brand !== 'vmt' && o.product?.metadata?.brand !== 'vmt') return new Response('Not VMT', { status: 202 });
  const email = (o.customer?.email || '').toLowerCase();
  if (!email) return new Response('No email', { status: 202 });
  const createdAt = o.created_at || new Date().toISOString();
  const origin = new URL(request.url).origin;
  if (o.metadata?.kind === 'upgrade') {
    try {
      return await applyUpgrade(env, origin, o, email);
    } catch (err) {
      console.error('Polar upgrade error:', err);
      return new Response('Internal error', { status: 500 });
    }
  }
  const items = itemsOf(o).map((it) => ({
    ...it,
    expiresAt: it.license === 'MP3' ? new Date(new Date(createdAt).getTime() + MP3_DAYS * 864e5).toISOString() : '',
  }));

  try {
    const token = await getGoogleAccessToken(env);
    const fresh = [];
    for (const it of items) {
      const isNew = await saveLicense(env, token, it.id, {
        email: { stringValue: email },
        beat: { stringValue: it.beat },
        slug: { stringValue: it.slug },
        license: { stringValue: it.license },
        amount: { doubleValue: it.amount },
        createdAt: { stringValue: createdAt },
        expiresAt: { stringValue: it.expiresAt },
        orderId: { stringValue: String(o.id) },
        reminded: { booleanValue: false },
      });
      if (isNew) fresh.push(it);
    }
    // Email μόνο για καινούργιες άδειες. Σε retry του Polar συνεχίζουμε για το account (η προσθήκη είναι idempotent).
    if (fresh.length) {
      try {
        await sendFilesEmail(env, origin, email, fresh);
      } catch (e) {
        console.error('Files email failed:', e);
      }
    }

    const userDoc = await findUserByEmail(env, token, email);
    if (!userDoc) return new Response('Recorded, no site account', { status: 202 });

    for (const it of items) {
      await appendPurchase(env, token, userDoc.name, {
        orderId: it.id,
        product: `${it.beat} · ${it.license}`,
        amount: it.amount,
        createdAt,
        license: it.license,
        expiresAt: it.expiresAt,
      });
    }

    return new Response('OK', { status: 202 });
  } catch (err) {
    console.error('Polar webhook error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
