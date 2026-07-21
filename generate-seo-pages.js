import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Βασικές Ρυθμίσεις
const DIST_DIR = path.resolve(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BLOG_JSON_PATH = path.resolve(__dirname, 'src/data/blog.json');
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
    title: 'Βιογραφία | Black Vybez',
    description: 'Η ιστορία πίσω από τον Black Vybez, το studio, τη νευροδιαφορετικότητα και τον ήχο.'
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
function injectMetaTags(htmlTemplate, { title, description, urlPath, imageUrl }) {
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
    const routeDir = path.join(DIST_DIR, route.path);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    const htmlContent = injectMetaTags(baseHtml, {
      title: route.title,
      description: route.description,
      urlPath: route.path
    });
    fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent);
    console.log(`✅ Δημιουργήθηκε: /${route.path}`);
  }

  // Β. Δυναμικές Σελίδες (Blog Posts)
  if (fs.existsSync(BLOG_JSON_PATH)) {
    const blogData = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, 'utf-8'));
    for (const post of blogData.posts) {
      if (!post.slug) continue;
      
      const postDir = path.join(DIST_DIR, 'blog', post.slug);
      if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
      }

      // Καθαρισμός HTML tags από το excerpt (αν υπάρχουν) για το meta description
      const cleanExcerpt = post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').substring(0, 155) : 'Διαβάστε το νέο άρθρο στο blog του Black Vybez.';

      const htmlContent = injectMetaTags(baseHtml, {
        title: `${post.title} | Black Vybez Blog`,
        description: cleanExcerpt,
        urlPath: `blog/${post.slug}`,
        imageUrl: post.cover || DEFAULT_IMAGE
      });
      fs.writeFileSync(path.join(postDir, 'index.html'), htmlContent);
      console.log(`✅ Δημιουργήθηκε: /blog/${post.slug}`);
    }
  }

  console.log('✨ Η παραγωγή SEO σελίδων ολοκληρώθηκε!');
}

generatePages().catch(console.error);
