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
  const fullUrl = `https://blackvybez.gr/${urlPath}`;
  if (!html.includes('<meta property="og:url"')) {
      html = html.replace('</head>', `  <meta property="og:url" content="${fullUrl}" />\n  </head>`);
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

  // Α. Στατικές Σελίδες
  for (const route of staticRoutes) {
    // Generate e.g. dist/blog.html instead of dist/blog/index.html
    const filePath = path.join(DIST_DIR, `${route.path}.html`);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const htmlContent = injectMetaTags(baseHtml, {
      title: route.title,
      description: route.description,
      urlPath: route.path
    });
    fs.writeFileSync(filePath, htmlContent);
    console.log(`✅ Δημιουργήθηκε: /${route.path}`);
  }

  // Β. Δυναμικές Σελίδες (Blog Posts)
  if (fs.existsSync(BLOG_JSON_PATH)) {
    const blogData = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, 'utf-8'));
    for (const post of blogData.posts) {
      if (!post.slug) continue;
      
      const filePath = path.join(DIST_DIR, 'blog', `${post.slug}.html`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Καθαρισμός HTML tags από το excerpt (αν υπάρχουν) για το meta description
      const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').substring(0, 155) : 'Διαβάστε το νέο άρθρο στο blog του Black Vybez.';

      const htmlContent = injectMetaTags(baseHtml, {
        title: `${post.title} | Black Vybez Blog`,
        description: cleanExcerpt,
        urlPath: `blog/${post.slug}`,
        imageUrl: post.cover || DEFAULT_IMAGE,
        postData: post
      });
      fs.writeFileSync(filePath, htmlContent);
      console.log(`✅ Δημιουργήθηκε: /blog/${post.slug}`);
    }
  }

  // Γ. Δυναμικές Σελίδες (Releases)
  if (fs.existsSync(RELEASES_JSON_PATH)) {
    const releasesFile = JSON.parse(fs.readFileSync(RELEASES_JSON_PATH, 'utf-8'));
    const allReleases = [...(releasesFile.releases || []), ...(releasesFile.upcoming || [])];
    
    for (const release of allReleases) {
      if (!release.slug) continue;
      
      const filePath = path.join(DIST_DIR, 'releases', `${release.slug}.html`);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const htmlContent = injectMetaTags(baseHtml, {
        title: `${release.title} - Black Vybez | Release`,
        description: release.description || `Ακούστε το ${release.title} από τον Black Vybez.`,
        urlPath: `releases/${release.slug}`,
        imageUrl: release.cover || DEFAULT_IMAGE,
        releaseData: release
      });
      fs.writeFileSync(filePath, htmlContent);
      console.log(`✅ Δημιουργήθηκε: /releases/${release.slug}`);
    }
  }

  // Δ. Δυναμικές Σελίδες (Podcasts)
  const PODCASTS_JSON_PATH = path.resolve(__dirname, 'src/data/podcasts.json');
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

      const htmlContent = injectMetaTags(baseHtml, {
        title: `${podcast.title} | Black Vybez Podcast`,
        description: podcast.description || `Ακούστε το επεισόδιο ${podcast.title} από το podcast του Black Vybez.`,
        urlPath: `podcasts/${podcast.slug}`,
        imageUrl: DEFAULT_IMAGE,
        podcastData: podcastDataObj
      });
      fs.writeFileSync(filePath, htmlContent);
      console.log(`✅ Δημιουργήθηκε: /podcasts/${podcast.slug}`);
    }
  }

  console.log('✨ Η παραγωγή SEO σελίδων ολοκληρώθηκε!');
}

generatePages().catch(console.error);
