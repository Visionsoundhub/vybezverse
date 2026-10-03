// Συμφωνητικό άδειας σε PDF: σελίδα 1 ελληνικά, σελίδα 2 αγγλικά (αυτό ζητάνε DistroKid και YouTube).
// Φτιάχνεται τη στιγμή που το ζητάει ο πελάτης, από τα στοιχεία της άδειας στη βάση.
// assets: { regular, bold, logo } σε bytes (Noto Sans για τα ελληνικά, λογότυπο VMT λευκό).
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Σύντομος, «δικός μας» αριθμός άδειας από το id του Polar: VMT-ΕΕΜΜ-XXXXX.
export async function licenseNumber(id, createdAt) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(id))));
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = [...h.slice(0, 5)].map((b) => abc[b % abc.length]).join('');
  const d = new Date(createdAt || Date.now());
  return `VMT-${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}-${code}`;
}

const T = {
  el: {
    title: 'Άδεια χρήσης beat',
    sub: 'Μη αποκλειστική άδεια',
    rows: ['Αριθμός άδειας', 'Ημερομηνία', 'Παραγωγός', 'Κάτοχος άδειας', 'Beat', 'Άδεια', 'Αρχεία', 'Streams', 'Διάρκεια', 'Credit'],
    lic: {
      mp3: { files: 'MP3 χωρίς tag', streams: 'Έως 100.000', term: '1 χρόνος' },
      wav: { files: 'WAV και MP3 χωρίς tag', streams: 'Έως 500.000', term: 'Για πάντα' },
      stems: { files: 'WAV, MP3 και όλα τα κανάλια (stems)', streams: 'Απεριόριστα', term: 'Για πάντα' },
    },
    until: (d) => `, ισχύει έως ${d}`,
    termsTitle: 'Τι ισχύει',
    terms: (lic) => [
      'Ο κάτοχος μπορεί να γράψει ένα νέο τραγούδι πάνω στο beat, να το ανεβάσει σε όλες τις πλατφόρμες, να το πουλήσει και να το παίξει live, μέσα στα όρια αυτής της άδειας. Τα έσοδα του τραγουδιού είναι δικά του.',
      'Τα πνευματικά δικαιώματα του beat μένουν στον παραγωγό. Η άδεια δεν είναι αποκλειστική: το beat μπορεί να το πάρει και άλλος καλλιτέχνης.',
      'Στον τίτλο ή στην περιγραφή του τραγουδιού γράφεται «prod. vybezmadethis».',
      'Δεν επιτρέπεται να πουληθεί, να μοιραστεί ή να ανέβει το beat σκέτο, να περάσει το beat ή το τραγούδι σε Content ID ή παρόμοιο σύστημα, ούτε να δοθεί η άδεια σε άλλον.',
      lic === 'mp3'
        ? 'Η άδεια MP3 ισχύει έναν χρόνο. Ανανεώνεται ή γίνεται WAV για πάντα στο blackvybez.gr/beats.'
        : lic === 'wav' ? 'Αν το τραγούδι περάσει τα 500.000 streams, η άδεια γίνεται Stems στο blackvybez.gr/beats.' : null,
      'Αν το beat πουληθεί αργότερα αποκλειστικά, αυτή η άδεια συνεχίζει να ισχύει κανονικά.',
      'Η πληρωμή έγινε μέσω Polar Software Inc. (merchant of record). Όλοι οι όροι: blackvybez.gr/beats/oroi',
    ].filter(Boolean),
    foot: 'Απορίες ή claim στο YouTube: support@blackvybez.gr',
    ref: 'Αριθμός παραγγελίας Polar',
  },
  en: {
    title: 'Beat License',
    sub: 'Non-exclusive license',
    rows: ['License number', 'Date', 'Producer', 'Licensee', 'Beat', 'License', 'Files', 'Streams', 'Term', 'Credit'],
    lic: {
      mp3: { files: 'MP3 (untagged)', streams: 'Up to 100,000', term: '1 year' },
      wav: { files: 'WAV and MP3 (untagged)', streams: 'Up to 500,000', term: 'Perpetual' },
      stems: { files: 'WAV, MP3 and all track stems', streams: 'Unlimited', term: 'Perpetual' },
    },
    until: (d) => `, valid until ${d}`,
    termsTitle: 'Terms',
    terms: (lic) => [
      'The Licensee may record one new song using the beat, distribute it on all platforms, sell it and perform it live, within the limits of this license. The income from the song belongs to the Licensee.',
      'The Producer keeps full ownership and copyright of the beat. This license is non-exclusive: the beat may be licensed to other artists.',
      'The song must credit "prod. vybezmadethis" in its title or description.',
      'The beat may not be resold, shared or distributed on its own, registered (alone or in the song) in Content ID or similar systems, and this license may not be transferred.',
      lic === 'mp3'
        ? 'The MP3 license is valid for one year. It can be renewed or turned into a perpetual WAV license at blackvybez.gr/beats.'
        : lic === 'wav' ? 'If the song passes 500,000 streams, the license can be moved to Stems at blackvybez.gr/beats.' : null,
      'If the beat is later sold exclusively, this license stays valid under its terms.',
      'Payment processed by Polar Software Inc. (merchant of record). Full terms: blackvybez.gr/beats/oroi',
    ].filter(Boolean),
    foot: 'Questions or YouTube claims: support@blackvybez.gr',
    ref: 'Polar order',
  },
};

export async function licensePdf(lic, assets) {
  const kind = String(lic.license || '').toLowerCase();
  const no = await licenseNumber(lic.id, lic.createdAt);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(assets.regular, { subset: true });
  const bold = await doc.embedFont(assets.bold, { subset: true });
  const logo = assets.logo ? await doc.embedPng(assets.logo) : null;
  doc.setTitle(`${no} ${lic.beat} (${lic.license})`);
  doc.setAuthor('Vybezmadethis');

  const orange = rgb(1, 0.4, 0);
  const dark = rgb(0.078, 0.07, 0.063);
  const grey = rgb(0.42, 0.4, 0.38);
  const ink = rgb(0.1, 0.1, 0.1);

  for (const lang of ['el', 'en']) {
    const t = T[lang];
    const L = t.lic[kind] || t.lic.mp3;
    const page = doc.addPage([595, 842]);
    // Μαύρη μπάρα με λογότυπο
    page.drawRectangle({ x: 0, y: 742, width: 595, height: 100, color: dark });
    page.drawRectangle({ x: 0, y: 740, width: 595, height: 2, color: orange });
    if (logo) {
      const s = 56 / logo.height;
      page.drawImage(logo, { x: 48, y: 764, width: logo.width * s, height: 56 });
    }
    page.drawText('VYBEZMADETHIS', { x: 130, y: 800, size: 9, font: bold, color: orange });
    page.drawText(t.title, { x: 130, y: 774, size: 22, font: bold, color: rgb(0.96, 0.95, 0.93) });
    page.drawText(no, { x: 547 - bold.widthOfTextAtSize(no, 11), y: 800, size: 11, font: bold, color: orange });
    page.drawText(t.sub, { x: 547 - font.widthOfTextAtSize(t.sub, 9), y: 784, size: 9, font, color: rgb(0.6, 0.58, 0.55) });

    let y = 700;
    const date = (d) => (d ? new Date(d).toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', { timeZone: 'Europe/Athens' }) : '');
    const vals = [
      no,
      date(lic.createdAt),
      'Vybezmadethis, support@blackvybez.gr',
      lic.email,
      lic.beat,
      lic.license,
      L.files,
      L.streams,
      lic.expiresAt && kind === 'mp3' ? L.term + t.until(date(lic.expiresAt)) : L.term,
      'prod. vybezmadethis',
    ];
    t.rows.forEach((k, i) => {
      page.drawText(k, { x: 48, y, size: 9.5, font: bold, color: grey });
      page.drawText(String(vals[i] || ''), { x: 190, y, size: 11, font: i === 4 || i === 5 ? bold : font, color: i === 0 ? orange : ink });
      y -= 21;
    });

    y -= 14;
    page.drawText(t.termsTitle, { x: 48, y, size: 14, font: bold, color: ink });
    y -= 22;
    for (const p of t.terms(kind)) {
      const words = p.split(' ');
      let cur = '';
      let first = true;
      const flush = () => {
        if (first) page.drawRectangle({ x: 48, y: y + 3, width: 4, height: 4, color: orange });
        page.drawText(cur, { x: 60, y, size: 10.5, font, color: ink });
        y -= 15;
        first = false;
      };
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w;
        if (font.widthOfTextAtSize(next, 10.5) > 487) { flush(); cur = w; } else cur = next;
      }
      if (cur) flush();
      y -= 7;
    }

    page.drawRectangle({ x: 48, y: 70, width: 499, height: 1, color: rgb(0.85, 0.83, 0.8) });
    page.drawText(t.foot, { x: 48, y: 52, size: 9, font, color: grey });
    const ref = `${t.ref}: ${lic.orderId || lic.id}`;
    page.drawText(ref, { x: 48, y: 38, size: 7.5, font, color: grey });
    const brand = 'vybezmadethis · The Robe Producer · blackvybez.gr/beats';
    page.drawText(brand, { x: 547 - font.widthOfTextAtSize(brand, 9), y: 52, size: 9, font, color: orange });
  }
  return doc.save();
}
