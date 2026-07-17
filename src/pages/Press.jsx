import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import pressData from '../data/press.json';
import './Press.css';

function Press() {
  const reduce = useReducedMotion();
  const articles = pressData.articles || [];

  return (
    <div className="prs">
      <header className="container prs-hero">
        <div className="prs-eyebrow">Press · Media · TV</div>
        <h1 className="prs-title">In the <span>headlines</span></h1>
        <p className="prs-lead">
          Τηλεοπτικές εμφανίσεις, συνεντεύξεις, και το κοινωνικό αποτύπωμα του Black Vybez στα media.
        </p>
      </header>

      <div className="container prs-grid">
        {articles.map((article, idx) => {
          const isVideo = article.link && (article.link.includes('youtube') || article.link.includes('antenna.gr'));
          return (
            <motion.a
              key={idx}
              href={article.link}
              target="_blank"
              rel="noreferrer"
              className="prs-card"
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: reduce ? 0 : (idx % 2) * 0.08 }}
            >
              <div className="prs-media">
                <img src={article.image} alt={article.title} loading="lazy" />
                <span className="prs-source">{(article.source || '').toUpperCase()}</span>
              </div>
              <div className="prs-content">
                <div className="prs-meta">
                  <span className="prs-src-name">{article.source}</span>
                  <span className="prs-date">{article.date}</span>
                </div>
                <h3 className="prs-headline">{article.title}</h3>
                <p className="prs-summary">{article.summary}</p>
                <span className="prs-cta">
                  {isVideo ? 'Δες το βίντεο' : 'Διάβασε το άρθρο'} <ArrowRight size={17} />
                </span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

export default Press;
