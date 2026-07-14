# VYBEZVERSE — Redesign notes (Direction A "Pressing")

_Last updated: 2026-07-14_

Full frontend redesign of the Black Vybez site. Warm, tactile, print/editorial look ("Pressing"). Moved away completely from the old magenta/violet neon-glassmorphism.

---

## Run it locally (at home)

```bash
cd vybezverse
npm install
npm run dev        # opens on http://localhost:5173 (we used --port 5199 here)
```

Boots with **no local `.env`** — Firebase config is hardcoded in `src/firebase.js`, and there is no `import.meta.env` usage in `src`. (The `.env.r2` / R2 / Lemon files are Node-side tooling, not needed to render the site.)

---

## Design system

- **Tokens:** all in `src/index.css` as CSS variables (primitive → semantic → component). Legacy variable/class names (`--accent-magenta`, `.glass-card`, `.btn-primary`, `.text-gradient`, …) were **kept as aliases** and remapped to the new values, so existing components didn't break.
- **Palette:** ink `#16110F`, bone `#ECE3D0`, ochre `#E0902F` (main accent), oxblood `#7C2B25`, pine `#2E5B4E`, vermilion `#E24A26`.
- **Fonts:** Bricolage Grotesque (display), Familjen Grotesk (body), Space Mono (mono/data), Caveat (handwritten).
- **Calm mode:** add class `calm` to `<html>` or `<body>` → reduced contrast / muted accents / no hard shadows (sensory-friendly). A UI toggle for it is not wired yet.
- **Reduced motion:** respected globally + via framer-motion `useReducedMotion`.
- **Signature print shadow:** `var(--shadow-print)` = `3px 3px 0 oxblood`. Buttons/cards use it.

---

## What's DONE

- `src/index.css` — full token system + `.tip` hover-tooltip utility.
- **Home** (`Home.jsx` / `Home.css`) — full rebuild: editorial layout, huge Bricolage type, poster card, genre tape strips (plain genre names), tracklist index, beats list. Removed the old canvas frame-scrubbing + centered full-screen sticky sections.
- **Navbar** — Pressing (ink bg, display logo, mono links, ochre active) + BLOG link added to MORE.
- **AudioPlayer** — Pressing; waveform recolored ochre→vermilion (`AudioPlayer.jsx` lines ~64-74).
- **ChatbotWidget** — Pressing (ochre, squared, no pink/purple).
- **Links** (`Links.jsx`) — rebuilt with **real** links: Spotify/Apple/YouTube + socials IG/TT/FB/YT. No more unsplash/dead `#` links.
- **Releases** — Pressing. "Listen everywhere" (Spotify/Apple/YouTube). Each track: Stream via Spotify/Apple/YouTube + **Αγόρασε** button with a tooltip listing what the single bundle includes. Jazz Bar = Apple + YouTube lyric video only (no Spotify). Old bundle/VIP purple sections removed.
- **Store** — now a clean **"Coming soon"** empty state (merch not ready).
- **Podcasts** — 8 Spotify **episode** embeds, each its own card; latest episode featured as hero + "Θες να τα ακούσεις με τη σειρά;" list. Add episodes by pasting Spotify episode IDs into the `EPISODES` array in `Podcasts.jsx`.
- **Beats** — hero background purple → warm ochre/oxblood.
- **Blog** (NEW) — `/blog` list + `/blog/:slug` post. Data-driven, see below.

Real links wired: Spotify artist `6I1CYhPF8JMoaCh2zIeGe3`, Apple artist `1510069891`, YouTube `@BlackVybezwiththeflow`, IG `@blackvybez_`, TikTok `@blackvybez`, FB `61555325559295`.

---

## Blog — how the AI writer adds posts

Append an object to `src/data/blog.json` → `posts[]`:

```json
{
  "slug": "unique-url-slug",
  "title": "Τίτλος",
  "date": "2026-07-21",
  "author": "Black Vybez",
  "tag": "Mindset",
  "cover": "",
  "excerpt": "1-2 sentence preview.",
  "content": "Paragraph.\n\n## Subheading\n\nAnother paragraph."
}
```

`content` rules: `\n\n` = new paragraph, a line starting with `## ` = subheading. Newest date auto-sorts to the top.

---

## What's NOT done — TODO before going live

**Pages still old / inconsistent (need Pressing restyle):**
- Bio, Press, Gallery, Account, Dashboard
- BeatStore / Beats (only the hero was fixed — the rest of Beats + the BeatStore page still need work)
- Footer component

**Fake data to replace with REAL:**
- `Releases.jsx` singles: **Neon Nights, Midnight Drive, Lost In Translation** are placeholders. Albums: ΠΑΛΙΡΡΟΙΑ track count, "The Beat Tape Vol.1". Keep only real releases + real per-release links.

**Money-path NOT tested (critical):**
- BeatStore Lemon Squeezy checkout, license PDF (`utils/generateLicense.js`), cart, Firebase auth/login, newsletter signup, chatbot backend. These were only restyled — test end-to-end in production before trusting them.

**Assets / SEO:**
- favicon (still Vite default), `<title>` + meta description in `index.html`, OG share image, real release covers + avatar (Links currently uses `/assets/uploads/banner.png`).

**Other:**
- Mobile responsive pass on every page.
- Logo: not built yet — orange `#E0902F` + black `#16110F`. Want an SVG wordmark + "BV" monogram (for nav/favicon/merch).

---

## Go-live plan (recommended)

1. Finish remaining pages + remove fake data.
2. Deploy to a **staging URL first** (Cloudflare Pages preview — repo has `functions/`), don't overwrite the live site.
3. Test the full purchase flow + mobile.
4. Only then swap `blackvybez.gr`.

---

## Key files touched

```
src/index.css
src/pages/Home.jsx, Home.css
src/pages/Releases.jsx
src/pages/Store.jsx
src/pages/Podcasts.jsx
src/pages/Links.jsx, Links.css
src/pages/Beats.jsx
src/pages/Blog.jsx        (new)
src/pages/BlogPost.jsx    (new)
src/data/blog.json        (new)
src/components/Navbar.jsx, Navbar.css
src/components/AudioPlayer.jsx, AudioPlayer.css
src/components/ChatbotWidget.css
src/App.jsx               (routes: /blog, /blog/:slug)
```
