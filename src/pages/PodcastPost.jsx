import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Mic } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import podcastsData from '../data/podcasts.json';
import SectionBg from '../components/SectionBg';

function EpisodeFrame({ id, title, height }) {
  return (
    <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-print)' }}>
      <iframe
        title={title || 'Επεισόδιο'}
        src={`https://open.spotify.com/embed/episode/${id}?theme=0`}
        width="100%"
        height={height}
        style={{ display: 'block', border: 0 }}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}

function PodcastPost() {
  const { slug } = useParams();
  const reduce = useReducedMotion();
  const podcast = podcastsData.podcasts.find(p => p.slug === slug);

  if (!podcast) {
    return <Navigate to="/podcasts" replace />;
  }

  return (
    <div className="container" style={{ paddingTop: '110px', paddingBottom: '100px', maxWidth: '800px' }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 15 }}
        animate={reduce ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/podcasts" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '30px' }}>
          <ArrowLeft size={16} /> Πίσω στα Podcasts
        </Link>

        <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', fontSize: '.8rem', marginBottom: 12 }}>
          <Mic size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Season {podcast.season} · Επεισόδιο {podcast.episode}
        </div>
        
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>
          {podcast.title}
        </h1>

        <div style={{ marginBottom: '40px' }}>
          <EpisodeFrame id={podcast.id} title={podcast.title} height={232} />
        </div>

        <div className="blog-content" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text)' }}>
          <p>{podcast.description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default PodcastPost;
