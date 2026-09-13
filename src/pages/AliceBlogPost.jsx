import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Renders posts published via POST /api/blog-publish (the ALICE
// integration). Separate from /blog/:slug on purpose: those come from the
// static, build-time blog.json; these come from Firestore's
// `external_blog_posts` collection and appear live with no rebuild/deploy,
// which is the whole point of giving ALICE its own endpoint.

function fmt(d) {
  try {
    return new Date(d).toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return d; }
}

function AliceBlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined = loading, null = not found
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setPost(undefined);
    getDoc(doc(db, 'external_blog_posts', slug))
      .then((snap) => {
        if (!alive) return;
        setPost(snap.exists() ? snap.data() : null);
      })
      .catch((e) => {
        if (!alive) return;
        console.error('Failed to load post', e);
        setError('Κάτι πήγε στραβά κατά τη φόρτωση.');
        setPost(null);
      });
    return () => { alive = false; };
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="container" style={{ paddingTop: '160px', paddingBottom: '160px', textAlign: 'center', color: 'var(--text-dim)' }}>
        Φόρτωση...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ paddingTop: '160px', paddingBottom: '160px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem' }}>Το άρθρο δεν βρέθηκε</h1>
        {error && <p style={{ color: 'var(--text-dim)', marginTop: 10 }}>{error}</p>}
        <Link to="/blog" className="hm-more" style={{ display: 'inline-block', marginTop: 18 }}>← Πίσω στο journal</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '130px', paddingBottom: '110px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link to="/blog" className="hm-more" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 30 }}>
          <ArrowLeft size={14} /> Journal
        </Link>

        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>
          <span>{fmt(post.published_at)}</span>
          {post.author && <span>· {post.author}</span>}
          {(post.tags || []).map((t) => <span key={t} style={{ color: 'var(--accent)' }}>· {t}</span>)}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,3.4rem)', lineHeight: 1.02, letterSpacing: '-.02em', margin: '0 0 16px' }}>{post.title}</h1>

        {post.excerpt && (
          <p style={{ color: 'var(--text-dim)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: 30 }}>{post.excerpt}</p>
        )}

        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-print)', marginBottom: 40 }} />
        )}

        <article
          style={{ color: 'var(--text)', fontSize: '1.15rem', lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />
      </div>
    </div>
  );
}

export default AliceBlogPost;
