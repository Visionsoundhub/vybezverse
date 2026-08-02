import React from 'react';
import { Music, Play, ShoppingBag, Star, Globe, ExternalLink } from 'lucide-react';
import linksData from '../data/links.json';
import releasesData from '../data/releases.json';
import './Links.css';

const SPOTIFY = 'https://open.spotify.com/artist/6I1CYhPF8JMoaCh2zIeGe3';
const APPLE = 'https://music.apple.com/gr/artist/black-vybez/1510069891';
const YOUTUBE = 'https://www.youtube.com/@BlackVybezwiththeflow';
const INSTAGRAM = 'https://www.instagram.com/blackvybez_/';
const TIKTOK = 'https://www.tiktok.com/@blackvybez';
const FACEBOOK = 'https://www.facebook.com/profile.php?id=61555325559295';

function Links() {
  // Same convention as Home.jsx: first entry in releases.json is the newest
  // single, so this "new release" card follows whatever's actually current
  // instead of the separate, easy-to-forget copy that used to live in
  // links.json (it stayed pinned to Jazz Bar through two later releases).
  const latestRelease = releasesData.releases?.[0];

  return (
    <div className="links-page">
      <div className="links-container">

        <div className="links-profile">
          <div className="links-avatar-ring">
            <img className="links-avatar" src={linksData.profileImage || '/assets/uploads/banner.png'} alt="Black Vybez" />
          </div>
          <h1 className="links-name">BLACK VYBEZ</h1>
          <p className="links-tagline">Music · Beats · Apparel</p>
        </div>

        {linksData.showLatest && latestRelease?.cover && (
          <a className="links-latest" href={latestRelease.slug ? `https://blackvybez.gr/releases/${latestRelease.slug}` : (latestRelease.spotify || latestRelease.apple || APPLE)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
            <img className="links-release-cover" src={latestRelease.cover} alt={latestRelease.title} />
            <p className="links-release-title">New release: {latestRelease.title}</p>
          </a>
        )}

        <div className="links-actions">
          <a className="links-btn links-btn-highlight" href={SPOTIFY} target="_blank" rel="noreferrer"><Play size={20} /> Spotify</a>
          <a className="links-btn" href={APPLE} target="_blank" rel="noreferrer"><Music size={20} /> Apple Music</a>
          <a className="links-btn" href={YOUTUBE} target="_blank" rel="noreferrer"><ExternalLink size={20} /> YouTube</a>
          <a className="links-btn" href="/beats"><Star size={20} /> Beats catalog</a>
          <a className="links-btn" href="/store"><ShoppingBag size={20} /> Merch · coming soon</a>
          <a className="links-btn" href={(linksData.buttons && linksData.buttons[0] && linksData.buttons[0].url) || 'https://blackvybez.gr/'} target="_blank" rel="noreferrer"><Globe size={20} /> Official site</a>
        </div>

        <div className="links-socials">
          <a className="links-social-icon" href={INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Instagram"><span className="links-tiktok-icon">IG</span></a>
          <a className="links-social-icon" href={TIKTOK} target="_blank" rel="noreferrer" aria-label="TikTok"><span className="links-tiktok-icon">TT</span></a>
          <a className="links-social-icon" href={FACEBOOK} target="_blank" rel="noreferrer" aria-label="Facebook"><span className="links-tiktok-icon">FB</span></a>
          <a className="links-social-icon" href={YOUTUBE} target="_blank" rel="noreferrer" aria-label="YouTube"><span className="links-tiktok-icon">YT</span></a>
        </div>

        <p className="links-footer">Vybezverse</p>
      </div>
    </div>
  );
}

export default Links;
