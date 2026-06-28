import React from 'react';
import galleryData from '../data/gallery.json';

function Gallery() {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '16px' }}>GALLERY</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Visual vibes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {galleryData.images.map((img, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '100%', height: '250px', borderRadius: '16px', background: `url(${img.src}) center/cover`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            </div>
            <p style={{ textAlign: 'center', fontWeight: '800' }}>{img.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
