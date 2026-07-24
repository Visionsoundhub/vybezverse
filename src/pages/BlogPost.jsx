import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import blogData from '../data/blog.json';

function fmt(d) {
  try {
    return new Date(d).toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return d; }
}

function renderInline(text, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return href.startsWith('/')
        ? <Link key={`${key}-${j}`} to={href} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{label}</Link>
        : <a key={`${key}-${j}`} href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{label}</a>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${key}-${j}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${key}-${j}`}>{part}</React.Fragment>;
  });
}

function renderBody(content) {
  return (content || '').split(/\n\n+/).map((block, i) => {
    if (block.startsWith('### ')) {
      return <h3 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem,3vw,1.5rem)', letterSpacing: '-.01em', margin: '30px 0 12px' }}>{block.slice(4)}</h3>;
    }
    if (block.startsWith('## ')) {
      return <h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3.5vw,2rem)', letterSpacing: '-.02em', margin: '38px 0 14px' }}>{block.slice(3)}</h2>;
    }

    const lines = block.split('\n').filter(Boolean);

    if (lines.length && lines.every((l) => l.startsWith('> '))) {
      return (
        <blockquote key={i} style={{ borderLeft: '3px solid var(--accent)', margin: '0 0 22px', padding: '4px 0 4px 20px', color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.65 }}>
          {lines.map((l, j) => <p key={j} style={{ margin: j ? '10px 0 0' : 0 }}>{renderInline(l.slice(2), `${i}-${j}`)}</p>)}
        </blockquote>
      );
    }

    if (lines.length && lines.every((l) => /^-\s/.test(l))) {
      return (
        <ul key={i} style={{ margin: '0 0 22px', paddingLeft: '1.3em', color: 'var(--text)', fontSize: '1.15rem', lineHeight: 1.75 }}>
          {lines.map((l, j) => <li key={j} style={{ marginBottom: 8 }}>{renderInline(l.replace(/^-\s/, ''), `${i}-${j}`)}</li>)}
        </ul>
      );
    }

    if (lines.length && lines.every((l) => /^\d+\.\s/.test(l))) {
      return (
        <ol key={i} style={{ margin: '0 0 22px', paddingLeft: '1.3em', color: 'var(--text)', fontSize: '1.15rem', lineHeight: 1.75 }}>
          {lines.map((l, j) => <li key={j} style={{ marginBottom: 8 }}>{renderInline(l.replace(/^\d+\.\s/, ''), `${i}-${j}`)}</li>)}
        </ol>
      );
    }

    return <p key={i} style={{ color: 'var(--text)', fontSize: '1.15rem', lineHeight: 1.75, margin: '0 0 22px' }}>{renderInline(block, i)}</p>;
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
