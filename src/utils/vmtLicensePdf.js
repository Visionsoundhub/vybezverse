// Συμφωνητικό άδειας σε PDF (στα αγγλικά: αυτό ζητάνε DistroKid, YouTube και οι διανομές).
// Φτιάχνεται τη στιγμή που το ζητάει ο πελάτης, από τα στοιχεία της άδειας στη βάση.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const TERMS = {
  mp3: { files: 'MP3 (untagged)', streams: 'Up to 100,000 streams', term: '1 year from purchase' },
  wav: { files: 'WAV and MP3 (untagged)', streams: 'Up to 500,000 streams', term: 'Perpetual' },
  stems: { files: 'WAV, MP3 and track stems', streams: 'Unlimited streams', term: 'Perpetual' },
};

// Οι βασικές γραμματοσειρές του PDF δεν έχουν ελληνικά: ό,τι δεν γράφεται γίνεται «?».
const latin = (s) => String(s || '').replace(/[^\x20-\x7E]/g, '?');

export async function licensePdf({ id, email, beat, license, createdAt, expiresAt, orderId }) {
  const lic = String(license || '').toLowerCase();
  const t = TERMS[lic] || TERMS.mp3;
  const doc = await PDFDocument.create();
  doc.setTitle(`License ${latin(beat)} (${latin(license)})`);
  doc.setAuthor('Vybezmadethis');
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const orange = rgb(1, 0.4, 0);
  const grey = rgb(0.35, 0.35, 0.35);
  let y = 790;
  const line = (text, { f = font, size = 10.5, color = rgb(0.1, 0.1, 0.1), gap = 16, x = 56 } = {}) => {
    page.drawText(latin(text), { x, y, size, font: f, color });
    y -= gap;
  };
  const wrap = (text, opts = {}) => {
    const words = latin(text).split(' ');
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(next, 10.5) > 470) { line(cur, { gap: 14, ...opts }); cur = w; } else cur = next;
    }
    if (cur) line(cur, { gap: 14, ...opts });
  };

  line('VMT BEATS', { f: bold, size: 10, color: orange, gap: 22 });
  line('Non-Exclusive Beat License', { f: bold, size: 22, gap: 30 });
  const date = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
  const rows = [
    ['License ID', id],
    ['Order', orderId || id],
    ['Date', date(createdAt)],
    ['Licensor (Producer)', 'Vybezmadethis, support@blackvybez.gr'],
    ['Licensee', email],
    ['Beat', beat],
    ['License type', license],
    ['Files', t.files],
    ['Streams', t.streams],
    ['Term', expiresAt ? `${t.term}, valid until ${date(expiresAt)}` : t.term],
    ['Credit', 'prod. vybezmadethis'],
  ];
  for (const [k, v] of rows) {
    page.drawText(latin(k), { x: 56, y, size: 9.5, font: bold, color: grey });
    page.drawText(latin(v), { x: 190, y, size: 10.5, font });
    y -= 18;
  }
  y -= 10;
  line('Terms', { f: bold, size: 13, gap: 20 });
  [
    'The Licensor grants the Licensee a non-exclusive license to record one new song using the beat above and to distribute it on all streaming platforms, sell it and perform it live, within the limits of this license. The Licensee keeps the income from the song.',
    'The Licensor keeps full ownership and copyright of the beat. The beat may be licensed to other artists.',
    'The Licensee must credit "prod. vybezmadethis" in the title or description of the song.',
    'The Licensee may not resell, share or distribute the beat on its own, register the beat or the song in Content ID or similar systems, or transfer this license to another person.',
    'If the stream limit is exceeded or an MP3 license expires, the Licensee may renew or move to a higher license at blackvybez.gr/beats.',
    'If the beat is later sold exclusively, this license stays valid under its terms.',
    'Payment was processed by Polar Software Inc. as merchant of record. Full terms: blackvybez.gr/beats/oroi',
  ].forEach((p) => { wrap(`- ${p}`); y -= 6; });
  y -= 14;
  line('Questions or YouTube claims: support@blackvybez.gr', { size: 9.5, color: grey });
  line('vybezmadethis . The Robe Producer . blackvybez.gr/beats', { size: 9.5, color: orange });
  return doc.save();
}
