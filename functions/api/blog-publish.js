// POST /api/blog-publish
//
// Lets an external system (ALICE) publish a blog post that goes live at
// blackvybez.gr/blogs/<slug> immediately, no site rebuild needed. Posts land
// in the `external_blog_posts` Firestore collection (separate from the
// static, build-time blog.json posts under /blog) and the /blogs/:slug page
// reads that collection directly.
//
// Auth: Authorization: Bearer <BLOG_API_TOKEN>
//
// Requires these Cloudflare Pages env vars (Settings -> Environment
// variables, never in the repo):
//   BLOG_API_TOKEN        - shared secret ALICE sends as the bearer token
//   FIREBASE_PROJECT_ID    \
//   FIREBASE_CLIENT_EMAIL   } already set for the Lemon Squeezy webhook
//   FIREBASE_PRIVATE_KEY   /

import { getGoogleAccessToken, firestoreSet } from '../../src/utils/firebaseAdmin';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// Constant-time-ish compare so token checking doesn't leak length/prefix
// via response timing the way a plain `===` scan can.
function tokensMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.BLOG_API_TOKEN) {
    console.error('BLOG_API_TOKEN is not set');
    return json(500, { error: 'Server misconfigured' });
  }

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!tokensMatch(token, env.BLOG_API_TOKEN)) {
    return json(401, { error: 'Invalid or missing bearer token' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Body must be valid JSON' });
  }

  const { title, slug, excerpt, body_html, cover_image_url, tags, published_at, category, author } = body || {};

  if (!title || typeof title !== 'string') return json(400, { error: '"title" is required' });
  if (!slug || typeof slug !== 'string') return json(400, { error: '"slug" is required' });
  if (!SLUG_RE.test(slug)) return json(400, { error: '"slug" must be lowercase letters/numbers/hyphens only, e.g. "my-post-title"' });
  if (!body_html || typeof body_html !== 'string') return json(400, { error: '"body_html" is required' });
  if (excerpt !== undefined && typeof excerpt !== 'string') return json(400, { error: '"excerpt" must be a string' });
  if (cover_image_url !== undefined && typeof cover_image_url !== 'string') return json(400, { error: '"cover_image_url" must be a string' });
  if (tags !== undefined && !(Array.isArray(tags) && tags.every((t) => typeof t === 'string'))) {
    return json(400, { error: '"tags" must be an array of strings' });
  }
  if (published_at !== undefined && Number.isNaN(Date.parse(published_at))) {
    return json(400, { error: '"published_at" must be a valid ISO date string' });
  }
  if (category !== undefined && category !== 'news' && category !== 'blog') {
    return json(400, { error: '"category" must be "news" or "blog"' });
  }
  if (author !== undefined && typeof author !== 'string') return json(400, { error: '"author" must be a string' });

  try {
    const accessToken = await getGoogleAccessToken(env);
    await firestoreSet(env, accessToken, 'external_blog_posts', slug, {
      title,
      slug,
      excerpt: excerpt || '',
      body_html,
      cover_image_url: cover_image_url || '',
      tags: tags || [],
      published_at: published_at || new Date().toISOString(),
      category: category || 'blog',
      author: author || 'Black Vybez',
      source: 'alice',
      createdAt: new Date().toISOString(),
    });

    return json(200, { url: `https://blackvybez.gr/blogs/${slug}` });
  } catch (err) {
    console.error('blog-publish error:', err);
    return json(500, { error: 'Internal error while publishing' });
  }
}
