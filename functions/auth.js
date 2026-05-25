export async function onRequestGet(context) {
  const { GITHUB_CLIENT_ID } = context.env;
  
  if (!GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID not set. Go to Cloudflare Pages > Settings > Environment variables.', { status: 500 });
  }

  const redirectUri = new URL('/auth/callback', context.request.url).href;
  const scope = 'repo,user';

  return Response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`,
    302
  );
}
