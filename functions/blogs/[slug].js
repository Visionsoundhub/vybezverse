// GET /blogs/:slug
//
// Injects per-post SEO meta tags (title, description, OG/Twitter, canonical,
// Article JSON-LD with author) into the SPA shell before it's served, so
// posts published live by ALICE (POST /api/blog-publish) get the same
// crawlability as the static build-time blog posts, which generate-seo-pages.js
// already handles at build time. This does the equivalent job, but at
// request time, since ALICE posts don't go through a build.
//
// The React app (AliceBlogPost.jsx) still mounts and renders the post
// normally for real visitors; this only rewrites the HTML that's served
// before any JS runs, for search engines and social link previews. A
// <noscript> block with the plain content is also added so crawlers that
// don't execute JavaScript (some AI bots, older tools) can still read it.

import { getGoogleAccessToken, firestoreGet } from '../../src/utils/firebaseAdmin';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const slug = params.slug;

  // Fetch '/', not '/index.html' directly — Pages redirects the latter (308)
  // to '/', and reading a redirect response's body gives an empty string.
  const shellRes = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
  let html = await shellRes.text();

  try {
    const accessToken = await getGoogleAccessToken(env);
    const doc = await firestoreGet(env, accessToken, 'external_blog_posts', slug);
    if (!doc) {
      // Let the SPA's own "not found" state handle it client-side.
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const f = doc.fields || {};
    const title = f.title?.stringValue || '';
    const excerpt = f.excerpt?.stringValue || '';
    const bodyHtml = f.body_html?.stringValue || '';
    const image = f.cover_image_url?.stringValue || '';
    const author = f.author?.stringValue || 'Black Vybez';
    const publishedAt = f.published_at?.stringValue || '';
    const fullUrl = `https://blackvybez.gr/blogs/${slug}`;
    const pageTitle = `${title} | Black Vybez`;
    const description = excerpt || title;

    html = html.replace(/<title>.*?<\/title>/, `<title>${esc(pageTitle)}</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`);
    html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(pageTitle)}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(description)}" />`);
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(pageTitle)}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
    if (image) {
      html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${esc(image)}" />`);
      html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${esc(image)}" />`);
    }
    html = html.replace('</head>', `  <meta property="og:url" content="${fullUrl}" />\n  <link rel="canonical" href="${fullUrl}" />\n</head>`);

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      image: [image || 'https://blackvybez.gr/assets/uploads/banner.png'],
      datePublished: publishedAt,
      author: [{ '@type': 'Person', name: author, url: 'https://blackvybez.gr' }],
    };
    html = html.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>\n</head>`);

    const staticBody = `<noscript><article><h1>${esc(title)}</h1><p>${esc(description)}</p>${bodyHtml}</article></noscript>`;
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n${staticBody}`);

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (err) {
    console.error('blogs/[slug] meta injection failed:', err);
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}
