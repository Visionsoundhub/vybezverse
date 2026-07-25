// Lemon Squeezy overlay checkout helpers.
//
// lemon.js (loaded in index.html) can turn <a class="lemonsqueezy-button">
// into an overlay checkout, but it binds those links when it first scans the
// DOM. In this SPA the buy buttons are rendered by React afterwards, so that
// scan never sees them and the click just navigates away. Calling
// LemonSqueezy.Url.Open() from an onClick handler avoids the timing problem
// entirely.

const CHECKOUT_HOST_RE = /lemonsqueezy\.com\/checkout\//;

// The overlay only renders for checkout URLs carrying ?embed=1.
export function embedCheckoutUrl(url) {
  if (!url || !CHECKOUT_HOST_RE.test(url)) return url;
  return url.includes('?') ? `${url}&embed=1` : `${url}?embed=1`;
}

// Click handler for a buy link. Opens the overlay when lemon.js is available
// and the URL is a real product checkout; otherwise it does nothing and lets
// the <a href> navigate as usual (script blocked, offline, generic store
// landing page, middle-click / open-in-new-tab).
export function openCheckout(event, url) {
  if (!url || !CHECKOUT_HOST_RE.test(url)) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

  const open = window.LemonSqueezy?.Url?.Open;
  if (typeof open !== 'function') return;

  event.preventDefault();
  open(embedCheckoutUrl(url));
}
