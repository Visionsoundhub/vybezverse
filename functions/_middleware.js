// Τρέχει πριν από κάθε σελίδα:
// 1. www.blackvybez.gr -> blackvybez.gr (301)
// 2. Άγνωστες διαδρομές παίρνουν status 404 (το React δείχνει τη σελίδα «δεν βρέθηκε»)
const KNOWN = /^\/(?:|beats|store|gallery|podcasts|press|account|bio|links|releases|blog)\/?$|^\/(?:podcasts|releases|blog|blogs)\/[^/]+\/?$|^\/(?:api|admin|auth)(?:\/|$)/;

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 301);
  }
  const res = await ctx.next();
  const p = url.pathname;
  if (res.status === 200 && !/\.[a-z0-9]+$/i.test(p) && !KNOWN.test(p) && (res.headers.get('content-type') || '').includes('text/html')) {
    return new Response(res.body, { status: 404, headers: res.headers });
  }
  return res;
}
