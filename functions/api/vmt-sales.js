// Τελευταίες πραγματικές αγορές beats από το Polar, για την ειδοποίηση «Κάποιος πήρε…» στο store.
// Χωρίς ονόματα και email: μόνο beat, χώρα και ώρα. Το POLAR_TOKEN είναι secret στο Cloudflare Pages.
export async function onRequestGet({ env }) {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' };
  if (!env.POLAR_TOKEN) return new Response('[]', { headers });
  try {
    const r = await fetch('https://api.polar.sh/v1/orders/?limit=10&sorting=-created_at', {
      headers: { Authorization: `Bearer ${env.POLAR_TOKEN}` },
    });
    if (!r.ok) return new Response('[]', { headers });
    const { items = [] } = await r.json();
    const sales = items
      .filter((o) => o.status === 'paid' && o.total_amount > 0)
      .map((o) => ({
        beat: o.product?.metadata?.beat || (o.product?.name || '').split(' · ')[0],
        license: o.product?.metadata?.license || '',
        country: o.billing_address?.country || '',
        at: o.created_at,
      }));
    return new Response(JSON.stringify(sales), { headers });
  } catch {
    return new Response('[]', { headers });
  }
}
