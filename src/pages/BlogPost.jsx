import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import blogData from '../data/blog.json';

function fmt(d) {
  try {
    return new Date(d).toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return d; }
}

function renderBody(content) {
  return (content || '').split(/\n\n+/).map((block, i) => {
    if (block.startsWith('## ')) {
      return <h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3.5vw,2rem)', letterSpacing: '-.02em', margin: '38px 0 14px' }}>{block.slice(3)}</h2>;
    }
    return <p key={i} style={{ color: 'var(--text)', fontSize: '1.15rem', lineHeight: 1.75, margin: '0 0 22px' }}>{block}</p>;
  });
}

function BlogPost() {
  const { slug } = useParams();
  const post = (blogData.posts || []).find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="container" style={{ paddingTop: '160px', paddingBottom: '160px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem' }}>Το άρθρο δεν βρέθηκε</h1>
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

        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: '.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>
          <span>{fmt(post.date)}</span>
          {post.tag && <span style={{ color: 'var(--accent)' }}>· {post.tag}</span>}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,6vw,3.4rem)', lineHeight: 1.02, letterSpacing: '-.02em', margin: '0 0 16px' }}>{post.title}</h1>
        
        {post.author && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--text)', marginBottom: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontWeight: 'bold', fontSize: '0.8rem' }}>BV</div>
            <div>
              <div style={{ fontWeight: 600 }}>{post.author}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Producer & Creator</div>
            </div>
          </div>
        )}

        {post.cover ? (
          <img src={post.cover} alt={post.title} style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-print)', marginBottom: 40 }} />
        ) : null}

        <article>{renderBody(post.content)}</article>
      </div>
    </div>
  );
}

export default BlogPost;
