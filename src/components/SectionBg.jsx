import React from 'react';
import './SectionBg.css';

/**
 * Full-bleed background photo for a page section.
 * Drop as the first child of any `position: relative` section.
 *
 * parallax = native `background-attachment: fixed` (no JS, no scroll listener).
 * Only pass `parallax` on ONE section per page (typically the hero) — stacking
 * several fixed backgrounds forces the browser to repaint every one of them
 * on every scroll tick, which gets janky fast. The rest of a page's sections
 * should stay static (parallax={false}, the default): still full-bleed photos,
 * just without the scroll-locked background.
 * Static also auto-applies on mobile / prefers-reduced-motion regardless of
 * the prop, since iOS Safari doesn't support fixed backgrounds well and
 * motion should stay opt-in.
 */
export default function SectionBg({ src, position = 'center 28%', overlay = true, parallax = false }) {
  const style = {
    backgroundImage: overlay
      ? `linear-gradient(180deg, rgba(22,17,15,.90) 0%, rgba(22,17,15,.74) 42%, var(--bg) 96%), url(${src})`
      : `url(${src})`,
    backgroundPosition: position,
  };
  return <div className={`section-bg${parallax ? ' section-bg--parallax' : ''}`} style={style} aria-hidden="true" />;
}
