import React from 'react';
import './SectionBg.css';

/**
 * Full-bleed background photo for a page section.
 * Drop as the first child of any `position: relative` section.
 *
 * parallax = native `background-attachment: fixed` (no JS, no scroll listener).
 * Only pass `parallax` on ONE section per page (typically the hero); stacking
 * several fixed backgrounds forces the browser to repaint every one of them
 * on every scroll tick, which gets janky fast. The rest of a page's sections
 * should stay static (parallax={false}, the default): still full-bleed photos,
 * just without the scroll-locked background.
 * Static also auto-applies on mobile / prefers-reduced-motion regardless of
 * the prop, since iOS Safari doesn't support fixed backgrounds well and
 * motion should stay opt-in.
 */
export default function SectionBg({
  src,
  position = 'center 28%',
  overlay = true,
  parallax = false,
  overlayRgb = '22,17,15',
  overlayOpacity, // optional [top, mid] override, e.g. [0.55, 0.4], lets the photo show through more
}) {
  // Non-hero sections sit further down the scroll and don't need to compete
  // for attention the way the hero does, so dim them ~15-20% darker by default
  // so the photo reads as a faint backdrop. overlayRgb tints that backdrop
  // (e.g. matching an album's own color); overlayOpacity lets a section
  // lighten the dimming when the photo needs to stay visibly a *photo*
  // (otherwise a heavy tint that matches foreground art can flatten the
  // whole section into one undifferentiated color block).
  const [top, mid] = overlayOpacity || (parallax ? [0.9, 0.74] : [0.96, 0.89]);
  const overlayCss = `linear-gradient(180deg, rgba(${overlayRgb},${top}) 0%, rgba(${overlayRgb},${mid}) 42%, var(--bg) 96%)`;
  const style = {
    backgroundImage: overlay ? `${overlayCss}, url(${src})` : `url(${src})`,
    backgroundPosition: position,
  };
  return <div className={`section-bg${parallax ? ' section-bg--parallax' : ''}`} style={style} aria-hidden="true" />;
}
