import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Βασικές Ρυθμίσεις
const DIST_DIR = path.resolve(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BLOG_JSON_PATH = path.resolve(__dirname, 'src/data/blog.json');
const RELEASES_JSON_PATH = path.resolve(__dirname, 'src/data/releases.json');
const PODCASTS_JSON_PATH = path.resolve(__dirname, 'src/data/podcasts.json');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');
const SITE_URL = 'https://blackvybez.gr';
const DEFAULT_IMAGE = '/assets/uploads/banner.png'; // Ή όποιο είναι το default σου

// 2. Στατικές σελίδες και τα SEO στοιχεία τους
const staticRoutes = [
  {
    path: 'beats',
    title: 'Beats | Black Vybez Store',
    description: 'Αγόρασε premium beats από τον Black Vybez. Rap, Trap, Boom Bap, Amapiano. Βρες τον ήχο σου.'
  },
  {
    path: 'releases',
    title: 'Releases | Black Vybez',
    description: 'Ακούστε όλες τις επίσημες κυκλοφορίες του Black Vybez. Singles, EPs και το άλμπουμ ΠΑΛΙΡΡΟΙΑ.'
  },
  {
    path: 'podcasts',
    title: 'Podcasts | Black Vybez',
    description: 'Ακούστε τις συνεντεύξεις και τα podcasts του Black Vybez, κατευθείαν από το Spotify.'
  },
  {
    path: 'press',
    title: 'Press & Media | Black Vybez',
    description: 'Τηλεοπτικές εμφανίσεις, συνεντεύξεις, και το κοινωνικό αποτύπωμα του Black Vybez στα media.'
  },
  {
    path: 'bio',
    title: 'Βιογραφία | Black Vybez (Θοδωρής Παρασχάκης)',
    description: 'Η ιστορία πίσω από τον Black Vybez: Μουσικός παραγωγός από τη Λάρισα και την Αθήνα, beats, podcasts και η φωνή του για τη νευροδιαφορετικότητα (ΔΕΠΥ).'
  },
  {
    path: 'store',
    title: 'Store | Black Vybez',
    description: 'Επίσημο merchandise και προϊόντα Black Vybez. Coming soon.'
  },
  {
    path: 'links',
    title: 'Links | Black Vybez',
    description: 'Όλα τα επίσημα links, social media και μουσικές πλατφόρμες του Black Vybez.'
  },
  {
    path: 'blog',
    title: 'Blog | Black Vybez',
    description: 'Σκέψεις για τη μουσική, τη νευροδιαφορετικότητα και τη ζωή πίσω από τα beats. Το ημερολόγιο ενός producer.'
  }
];

// Helpers για static body (ώστε bots χωρίς JS — AI crawlers, NotebookLM κλπ — να βλέπουν κείμενο)
function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Ίδιοι markdown-lite κανόνες με το BlogPost.jsx renderer
function inlineMd(text) {
  let out = esc(text);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

function mdToHtml(content) {
  return String(content || '').split(/\n\n+/).map((block) => {
    if (block.startsWith('### ')) return `<h3>${inlineMd(block.slice(4))}</h3>`;
    if (block.startsWith('## ')) return `<h2>${inlineMd(block.slice(3))}</h2>`;
    const lines = block.split('\n').filter(Boolean);
    if (lines.length && lines.every((l) => l.startsWith('> ')))
      return `<blockquote>${lines.map((l) => `<p>${inlineMd(l.slice(2))}</p>`).join('')}</blockquote>`;
    if (lines.length && lines.every((l) => /^-\s/.test(l)))
      return `<ul>${lines.map((l) => `<li>${inlineMd(l.replace(/^-\s/, ''))}</li>`).join('')}</ul>`;
    if (lines.length && lines.every((l) => /^\d+\.\s/.test(l)))
      return `<ol>${lines.map((l) => `<li>${inlineMd(l.replace(/^\d+\.\s/, ''))}</li>`).join('')}</ol>`;
    return `<p>${inlineMd(block)}</p>`;
  }).join('\n');
}

// Βάζει πραγματικό κείμενο μέσα στο #root. Το React createRoot().render()
// αντικαθιστά το περιεχόμενο στο mount, οπότε οι χρήστες βλέπουν το κανονικό app.
function injectStaticBody(html, bodyHtml) {
  if (!bodyHtml) return html;
  return html.replace('<div id="root"></div>', `<div id="root"><main>\n${bodyHtml}\n</main></div>`);
}

// 3. Helper συνάρτηση για να αντικαθιστά τα Meta Tags
function injectMetaTags(htmlTemplate, { title, description, urlPath, imageUrl, postData, releaseData, podcastData }) {
  let html = htmlTemplate;

  // Αντικατάσταση Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`);

  // Αντικατάσταση Description
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`);

  // Αντικατάσταση Image (Αν έχει συγκεκριμένο το post, αλλιώς default)
  const finalImage = imageUrl || DEFAULT_IMAGE;
  html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${finalImage}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${finalImage}" />`);

  // Προσθήκη Canonical / URL στο Open Graph (προαιρετικό αλλά καλό για SEO)
  const fullUrl = `${SITE_URL}/${urlPath}`;
  if (!html.includes('<meta property="og:url"')) {
      html = html.replace('</head>', `  <meta property="og:url" content="${fullUrl}" />\n  </head>`);
  }
  if (!html.includes('rel="canonical"')) {
      html = html.replace('</head>', `  <link rel="canonical" href="${fullUrl}" />\n  </head>`);
  }

  // Αν πρόκειται για Blog Post, προσθέτουμε Article JSON-LD Schema
  if (postData) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": postData.title,
      "image": [imageUrl || DEFAULT_IMAGE],
      "datePublished": postData.date,
      "author": [{
        "@type": "Person",
        "name": postData.author || "Black Vybez",
        "url": "https://blackvybez.gr"
      }]
    };
    html = html.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n  </script>\n</head>`);
  }

  // Αν πρόκειται για Release, προσθέτουμε MusicAlbum JSON-LD Schema
  if (releaseData) {
    const musicSchema = {
      "@context": "https://schema.org",
      "@type": releaseData.type === 'Single' ? "MusicRelease" : "MusicAlbum",
      "name": releaseData.title,
      "image": imageUrl || DEFAULT_IMAGE,
      "byArtist": {
        "@type": "MusicGroup",
        "name": "Black Vybez"
      },
      "datePublished": releaseData.date || "2026",
      "url": fullUrl
    };
    html = html.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(musicSchema, null, 2)}\n  </script>\n</head>`);
  }

  // Αν πρόκειται για Podcast, προσθέτουμε PodcastEpisode JSON-LD Schema
  if (podcastData) {
    const podcastSchema = {
      "@context": "https://schema.org",
      "@type": "PodcastEpisode",
      "name": podcastData.title,
      "description": podcastData.description,
      "datePublished": podcastData.date,
      "episodeNumber": podcastData.episode,
      "partOfSeries": {
        "@type": "PodcastSeries",
        "name": "Μπαμπάς των 2 & Rapper",
        "url": "https://blackvybez.gr/podcasts"
      },
      "creator": {
        "@type": "Person",
        "name": "Black Vybez (Θοδωρής Παρασχάκης)",
        "url": "https://blackvybez.gr/bio"
      }
    };
    html = html.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(podcastSchema, null, 2)}\n  </script>\n</head>`);
  }

  return html;
}

async function generatePages() {
  console.log('Ξεκινάει η δημιουργία SEO HTML σελίδων (SSG)...');

  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('Δεν βρέθηκε το dist/index.html. Έτρεξες `npm run build` πρώτα;');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

  // Φόρτωση όλων των data για τα static bodies
  const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : null);
  const blogData = readJson(BLOG_JSON_PATH) || { posts: [] };
  const releasesFile = readJson(RELEASES_JSON_PATH) || { releases: [], upcoming: [] };
  const podcastsFile = readJson(PODCASTS_JSON_PATH) || { podcasts: [] };
  const bioData = readJson(path.resolve(__dirname, 'src/data/bio.json'));
  const beatsFile = readJson(path.resolve(__dirname, 'src/data/beats.json')) || { beatslist: [] };
  const pressFile = readJson(path.resolve(__dirname, 'src/data/press.json')) || { articles: [] };
  const liveReleases = releasesFile.releases || [];

  const releaseListHtml = liveReleases
    .map((r) => `<li><a href="/releases/${r.slug}">${esc(r.title)}</a>${r.tag ? ` — ${esc(r.tag)}` : ''}</li>`)
    .join('\n');
  const blogListHtml = blogData.posts
    .map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a> — ${esc(p.excerpt || '')}</li>`)
    .join('\n');
  const podcastListHtml = (podcastsFile.podcasts || [])
    .map((p) => `<li><a href="/podcasts/${p.slug}">${esc(p.title)}</a></li>`)
    .join('\n');

  // Static body ανά route (πραγματικό κείμενο για no-JS crawlers)
  const staticBodies = {
    beats: `<h1>Beats — Black Vybez Store</h1>
<p>Αγόρασε premium beats από τον Black Vybez. Trap, Drill, Boombap, R&amp;B, Synthwave, Pop. Άδειες: Showcase, Premium, Unlimited.</p>
<ul>${beatsFile.beatslist.map((b) => `<li>${esc(b.title)}${b.bpm ? ` — ${esc(b.bpm)} BPM` : ''}${b.price ? ` — ${esc(b.price)}` : ''}</li>`).join('\n')}</ul>`,
    releases: `<h1>Releases — Black Vybez</h1>
<p>Όλες οι επίσημες κυκλοφορίες του Black Vybez. Singles και το επερχόμενο album ΠΑΛΙΡΡΟΙΑ.</p>
<ul>${releaseListHtml}</ul>`,
    podcasts: `<h1>Podcast — Μπαμπάς των 2 &amp; Rapper</h1>
<p>Το podcast του Black Vybez για τη ΔΕΠΥ, την πατρότητα και τη μουσική.</p>
<ul>${podcastListHtml}</ul>`,
    press: `<h1>Press &amp; Media — Black Vybez</h1>
<ul>${pressFile.articles.map((a) => `<li>${esc(a.title)} (${esc(a.source)})</li>`).join('\n')}</ul>`,
    bio: `<h1>${esc(bioData?.title || 'Βιογραφία — Black Vybez')}</h1>
${mdToHtml(bioData?.content || '')}`,
    store: `<h1>Store — Black Vybez</h1><p>Επίσημο merchandise Black Vybez. Coming soon.</p>`,
    links: `<h1>Black Vybez — Links</h1>
<ul>
<li><a href="https://open.spotify.com/artist/6I1CYhPF8JMoaCh2zIeGe3">Spotify</a></li>
<li><a href="https://music.apple.com/gr/artist/black-vybez/1510069891">Apple Music</a></li>
<li><a href="https://www.youtube.com/@BlackVybezwiththeflow">YouTube</a></li>
<li><a href="/releases">Κυκλοφορίες</a></li>
<li><a href="/beats">Beats</a></li>
</ul>`,
    blog: `<h1>Journal — Black Vybez</h1>
<p>Σκέψεις για τη μουσική, τη νευροδιαφορετικότητα και τη ζωή πίσω από τα beats.</p>
<ul>${blogListHtml}</ul>`
  };

  const homeBody = `<h1>Black Vybez — Vybezmadethis</h1>
<p>Ο Black Vybez (Θοδωρής Παρασχάκης) είναι Έλληνας rapper, μουσικός παραγωγός και τραγουδοποιός από τη Λάρισα. Δημιουργεί beats, κυκλοφορεί μουσική και μιλάει για τη νευροδιαφορετικότητα (ΔΕΠΥ) μέσα από το podcast «Μπαμπάς των 2 &amp; Rapper». Μουσική για κάθε διαφορετικό μυαλό.</p>
<ul>
<li><a href="/releases">Releases</a></li>
<li><a href="/beats">Beats store</a></li>
<li><a href="/blog">Journal</a></li>
<li><a href="/podcasts">Podcast</a></li>
<li><a href="/bio">Βιογραφία</a></li>
</ul>`;

  // Ομάδα: canonical/og:url + static body στην ίδια την αρχική σελίδα
  const homeHtml = injectStaticBody(injectMetaTags(baseHtml, {
    title: 'Black Vybez — Beats, Releases & Vybezverse',
    description: 'Black Vybez (Vybezmadethis) — producer από τη Λάρισα. Άκου beats, releases, podcasts και γίνε μέλος του Vybezverse. Μουσική για κάθε διαφορετικό μυαλό.',
    urlPath: ''
  }), homeBody);
  fs.writeFileSync(INDEX_HTML_PATH, homeHtml);
  console.log('✅ Ενημερώθηκε: / (canonical + static body)');

  // Α. Στατικές Σελίδες
  for (const route of staticRoutes) {
    // Generate e.g. dist/blog.html instead of dist/blog/index.html
    const filePath = path.join(DIST_DIR, `${route.path}.html`);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const htmlContent = injectStaticBody(injectMetaTags(baseHtml, {
      title: route.title,
      description: route.description,
      urlPath: route.path
    }), staticBodies[route.path]);
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Δημιουργήθηκε: /${route.path}`);
  }

  // Β. Δυναμικές Σελίδες (Blog Posts)
  for (const post of blogData.posts) {
    if (!post.slug) continue;

    const filePath = path.join(DIST_DIR, 'blog', `${post.slug}.html`);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Καθαρισμός HTML tags από το excerpt (αν υπάρχουν) για το meta description
    const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').substring(0, 155) : 'Διαβάστε το νέο άρθρο στο blog του Black Vybez.';

    const postBody = `<article><h1>${esc(post.title)}</h1>
<p>${esc(post.date)}${post.tag ? ` · ${esc(post.tag)}` : ''}${post.author ? ` · ${esc(post.author)}` : ''}</p>
${mdToHtml(post.content)}</article>`;

    const htmlContent = injectStaticBody(injectMetaTags(baseHtml, {
      title: `${post.title} | Black Vybez Blog`,
      description: cleanExcerpt,
      urlPath: `blog/${post.slug}`,
      imageUrl: post.cover || DEFAULT_IMAGE,
      postData: post
    }), postBody);
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Δημιουργήθηκε: /blog/${post.slug}`);
  }

  // Γ. Δυναμικές Σελίδες (Releases)
  {
    const allReleases = [...liveReleases, ...(releasesFile.upcoming || [])];

    for (const release of allReleases) {
      if (!release.slug) continue;

      const filePath = path.join(DIST_DIR, 'releases', `${release.slug}.html`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const relLinks = [
        release.spotify ? `<li><a href="${release.spotify}">Spotify</a></li>` : '',
        release.apple ? `<li><a href="${release.apple}">Apple Music</a></li>` : '',
        release.youtube ? `<li><a href="${release.youtube}">YouTube</a></li>` : ''
      ].filter(Boolean).join('\n');
      const releaseBody = `<article><h1>${esc(release.title)} — Black Vybez</h1>
<p>${esc(release.type || 'Single')}${release.tag ? ` · ${esc(release.tag)}` : ''}${release.date ? ` · ${esc(release.date)}` : ''}</p>
<p>${esc(release.description || '')}</p>
${relLinks ? `<ul>${relLinks}</ul>` : ''}
${release.comingSoon ? '<p>Έρχεται σύντομα.</p>' : `<p><a href="/releases">Αγόρασε το στη σελίδα Releases${release.price ? ` (${esc(release.price)})` : ''}</a></p>`}</article>`;

      const htmlContent = injectStaticBody(injectMetaTags(baseHtml, {
        title: `${release.title} - Black Vybez | Release`,
        description: release.description || `Ακούστε το ${release.title} από τον Black Vybez.`,
        urlPath: `releases/${release.slug}`,
        imageUrl: release.cover || DEFAULT_IMAGE,
        releaseData: release
      }), releaseBody);
      fs.writeFileSync(filePath, htmlContent);
      console.log(`✅ Δημιουργήθηκε: /releases/${release.slug}`);
    }
  }

  // Δ. Δυναμικές Σελίδες (Podcasts)
  if (fs.existsSync(PODCASTS_JSON_PATH)) {
    const podcastsFile = JSON.parse(fs.readFileSync(PODCASTS_JSON_PATH, 'utf-8'));
    
    for (const podcast of podcastsFile.podcasts || []) {
      if (!podcast.slug) continue;
      
      const filePath = path.join(DIST_DIR, 'podcasts', `${podcast.slug}.html`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // We'll create a minimal podcastData object to trigger JSON-LD in injectMetaTags
      const podcastDataObj = {
        title: podcast.title,
        description: podcast.description,
        date: podcast.date,
        episode: podcast.episode,
        season: podcast.season
      };

      const podcastBody = `<article><h1>${esc(podcast.title)} — Μπαμπάς των 2 &amp; Rapper</h1>
<p>${esc(podcast.date || '')}${podcast.episode ? ` · Επεισόδιο ${esc(podcast.episode)}` : ''}</p>
<p>${esc(podcast.description || '')}</p>
<p><a href="/podcasts">Όλα τα επεισόδια</a></p></article>`;

      const htmlContent = injectStaticBody(injectMetaTags(baseHtml, {
        title: `${podcast.title} | Black Vybez Podcast`,
        description: podcast.description || `Ακούστε το επεισόδιο ${podcast.title} από το podcast του Black Vybez.`,
        urlPath: `podcasts/${podcast.slug}`,
        imageUrl: DEFAULT_IMAGE,
        podcastData: podcastDataObj
      }), podcastBody);
      fs.writeFileSync(filePath, htmlContent);
      console.log(`✅ Δημιουργήθηκε: /podcasts/${podcast.slug}`);
    }
  }

  generateSitemap();

  console.log('✨ Η παραγωγή SEO σελίδων ολοκληρώθηκε!');
}

function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [{ loc: `${SITE_URL}/`, priority: '1.0' }];

  const priorities = { beats: '0.9', releases: '0.9', blog: '0.7' };
  for (const route of staticRoutes) {
    urls.push({ loc: `${SITE_URL}/${route.path}`, priority: priorities[route.path] || '0.6' });
  }

  if (fs.existsSync(BLOG_JSON_PATH)) {
    const blogData = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, 'utf-8'));
    for (const post of blogData.posts || []) {
      if (!post.slug) continue;
      urls.push({ loc: `${SITE_URL}/blog/${post.slug}`, lastmod: post.date, priority: '0.6' });
    }
  }

  if (fs.existsSync(RELEASES_JSON_PATH)) {
    const releasesFile = JSON.parse(fs.readFileSync(RELEASES_JSON_PATH, 'utf-8'));
    const allReleases = [...(releasesFile.releases || []), ...(releasesFile.upcoming || [])];
    for (const release of allReleases) {
      if (!release.slug) continue;
      urls.push({ loc: `${SITE_URL}/releases/${release.slug}`, lastmod: release.date, priority: '0.8' });
    }
  }

  if (fs.existsSync(PODCASTS_JSON_PATH)) {
    const podcastsFile = JSON.parse(fs.readFileSync(PODCASTS_JSON_PATH, 'utf-8'));
    for (const podcast of podcastsFile.podcasts || []) {
      if (!podcast.slug) continue;
      urls.push({ loc: `${SITE_URL}/podcasts/${podcast.slug}`, lastmod: podcast.date, priority: '0.5' });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`✅ sitemap.xml ενημερώθηκε (${urls.length} URLs)`);
}

generatePages().catch(console.error);
