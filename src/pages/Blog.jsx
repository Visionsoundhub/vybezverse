import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
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

const DEFAULT_COVER = '/assets/uploads/banner.png';

function CardMeta({ p }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
      {p.tag && <span className="blog-tag">{p.tag}</span>}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {fmt(p.date)}
      </span>
    </div>
  );
}

function FeaturedCard({ p }) {
  return (
    <Link to={p.href} className="blog-card blog-featured" style={{ marginBottom: 28 }}>
      <img src={p.cover || DEFAULT_COVER} alt={p.title} className="blog-card-img" />
      <div style={{ padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CardMeta p={p} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3.2vw,2.4rem)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '0 0 14px' }}>
          <span className="blog-card-title">{p.title}</span>
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 18 }}>{p.excerpt}</p>
        <span className="btn-primary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.85rem', padding: '10px 20px' }}>
          Διάβασε <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ p }) {
  return (
    <Link to={p.href} className="blog-card">
      <img src={p.cover || DEFAULT_COVER} alt={p.title} className="blog-card-img" />
      <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardMeta p={p} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '-.01em', lineHeight: 1.15, margin: '0 0 10px' }}>
          <span className="blog-card-title">{p.title}</span>
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '.92rem', lineHeight: 1.55, margin: '0 0 14px', flex: 1 }}>{p.excerpt}</p>
        <span className="hm-more" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          Διάβασε <ArrowUpRight size={12} />
        </span>
      </div>
    </Link>
  );
}

function Blog() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState('news');
  // Posts published live by ALICE via POST /api/blog-publish, on top of the
  // static build-time blog.json ones. Fetched once; each has its own route
  // (/blogs/:slug) since they live in Firestore, not the static bundle.
  const [alicePosts, setAlicePosts] = useState([]);

  useEffect(() => {
    let alive = true;
    getDocs(collection(db, 'external_blog_posts'))
      .then((snap) => {
        if (!alive) return;
        setAlicePosts(snap.docs.map((d) => d.data()));
      })
      .catch((e) => console.error('Failed to load ALICE posts', e));
    return () => { alive = false; };
  }, []);

  // Older posts predate the news/blog split; default them to news since the
  // first post ever written here was a release announcement.
  const staticPosts = (blogData.posts || []).map((p) => ({
    slug: p.slug,
    date: p.date,
    tag: p.tag,
    title: p.title,
    excerpt: p.excerpt,
    cover: p.cover,
    category: p.category || 'news',
    href: `/blog/${p.slug}`,
  }));
  const externalPosts = alicePosts.map((p) => ({
    slug: p.slug,
    date: p.published_at,
    tag: (p.tags || [])[0],
    title: p.title,
    excerpt: p.excerpt,
    cover: p.cover_image_url,
    category: p.category || 'blog',
    href: `/blogs/${p.slug}`,
  }));
  const posts = [...staticPosts, ...externalPosts]
    .filter((p) => p.category === tab)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const [featured, ...rest] = posts;

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
        style={{ marginTop: 32 }}>
        {posts.length === 0 && (
          <p style={{ color: 'var(--text-dim)', padding: '30px 0', borderTop: '1px solid var(--border)' }}>
            Δεν υπάρχουν άρθρα εδώ ακόμα.
          </p>
        )}

        {featured && <FeaturedCard p={featured} />}

        {rest.length > 0 && (
          <div className="blog-grid">
            {rest.map((p, i) => (
              <motion.div key={p.slug}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={reduce ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.05 }}
                style={{ height: '100%' }}>
                <PostCard p={p} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Blog;
