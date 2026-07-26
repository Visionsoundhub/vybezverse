import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import blogData from '../data/blog.json';

function fmt(d) {
  try {
    return new Date(d).toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return d; }
}

const TABS = [
  { key: 'news', label: 'Music News' },
  { key: 'blog', label: 'Blog' },
];

function Blog() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState('news');
  // Older posts predate the news/blog split; default them to news since the
  // first post ever written here was a release announcement.
  const posts = [...(blogData.posts || [])]
    .filter((p) => (p.category || 'news') === tab)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="container" style={{ paddingTop: '130px', paddingBottom: '110px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', fontSize: '.85rem', marginBottom: 16 }}>Journal</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,9vw,6rem)', lineHeight: 0.9, letterSpacing: '-.02em', margin: 0 }}>
        Από το <span style={{ color: 'var(--accent)' }}>studio</span>
      </h1>
      <p style={{ color: 'var(--text-dim)', fontSize: '1.15rem', lineHeight: 1.6, marginTop: 22, maxWidth: '56ch' }}>
        Σκέψεις για τη μουσική, τη νευροδιαφορετικότητα και τη ζωή πίσω από τα beats.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 40 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={tab === t.key ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '9px 20px', fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        style={{ marginTop: 24, display: 'flex', flexDirection: 'column' }}>
        {posts.length === 0 && (
          <p style={{ color: 'var(--text-dim)', padding: '30px 0', borderTop: '1px solid var(--border)' }}>
            Δεν υπάρχουν άρθρα εδώ ακόμα.
          </p>
        )}
        {posts.map((p, i) => (
          <motion.div key={p.slug}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.05 }}>
            <Link to={`/blog/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderTop: '1px solid var(--border)', padding: '30px 0' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                <span>{fmt(p.date)}</span>
                {p.tag && <span style={{ color: 'var(--accent)' }}>· {p.tag}</span>}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.4rem)', letterSpacing: '-.02em', lineHeight: 1.05, margin: 0, maxWidth: '20ch' }}>{p.title}</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.05rem', lineHeight: 1.55, marginTop: 12, maxWidth: '60ch' }}>{p.excerpt}</p>
              <span className="hm-more" style={{ display: 'inline-block', marginTop: 14 }}>Διάβασε <ArrowUpRight size={13} style={{ verticalAlign: -2 }} /></span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Blog;
