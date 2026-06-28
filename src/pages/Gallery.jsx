import React from 'react';

function Gallery() {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '16px' }}>GALLERY</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Visual vibes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Gallery Item 1 */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '100%', height: '250px', borderRadius: '16px', background: 'url(https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop) center/cover' }}></div>
          <p style={{ textAlign: 'center', fontWeight: '800' }}>Studio Session 2025</p>
        </div>

        {/* Gallery Item 2 */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '100%', height: '250px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Live at Athens</span>
          </div>
          <p style={{ textAlign: 'center', fontWeight: '800' }}>Live at Athens</p>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
