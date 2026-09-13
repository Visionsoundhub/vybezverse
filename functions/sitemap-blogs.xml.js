// GET /sitemap-blogs.xml
//
// The main sitemap.xml is generated at build time (generate-seo-pages.js)
// and only knows about static routes, so it can never list ALICE posts
// (external_blog_posts in Firestore) without a rebuild — which defeats the
// point of publishing them without one. This serves a second sitemap, built
// fresh on every request, and is referenced from robots.txt alongside the
// main one.

import { getGoogleAccessToken } from '../src/utils/firebaseAdmin';

async function listExternalPosts(env, accessToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/external_blog_posts`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Firestore list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.documents || [];
}

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const accessToken = await getGoogleAccessToken(env);
    const docs = await listExternalPosts(env, accessToken);

    const urls = docs.map((doc) => {
      const f = doc.fields || {};
      const slug = f.slug?.stringValue;
      const lastmod = f.published_at?.stringValue || f.createdAt?.stringValue || '';
      if (!slug) return '';
      return `  <url>\n    <loc>https://blackvybez.gr/blogs/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    }).filter(Boolean).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  } catch (err) {
    console.error('sitemap-blogs.xml error:', err);
    return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
