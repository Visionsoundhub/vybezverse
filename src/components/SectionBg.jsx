import React from 'react';
import './SectionBg.css';

/**
 * Full-bleed parallax background photo for a page section.
 * Drop as the first child of any `position: relative` section.
 * Parallax = native `background-attachment: fixed` (no JS, no scroll jank);
 * falls back to a static (non-parallax) image on mobile / prefers-reduced-motion,
 * since iOS Safari doesn't support fixed backgrounds and motion should be optional.
 */
export default function SectionBg({ src, position = 'center 28%', overlay = true }) {
  const style = {
    backgroundImage: overlay
      ? `linear-gradient(180deg, rgba(22,17,15,.90) 0%, rgba(22,17,15,.74) 42%, var(--bg) 96%), url(${src})`
      : `url(${src})`,
    backgroundPosition: position,
  };
  return <div className="section-bg" style={style} aria-hidden="true" />;
}
