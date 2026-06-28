import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Star, ShoppingCart, Send } from 'lucide-react';
import { motion } from 'framer-motion';

function Store() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Hoodies', 'T-Shirts', 'Accessories', 'Headwear'];

  // Dummy Merch Data
  const merchData = [
    { id: 1, title: 'Vybez Oversized Hoodie', category: 'Hoodies', price: '64.99€', isNew: true, imageColor: '#1a1a24' },
    { id: 2, title: 'Producer Essential Tee', category: 'T-Shirts', price: '29.99€', isNew: false, imageColor: '#201520' },
    { id: 3, title: 'Studio Beanie', category: 'Headwear', price: '19.99€', isNew: false, imageColor: '#11151a' },
    { id: 4, title: 'Midnight Club Tee', category: 'T-Shirts', price: '34.99€', isNew: true, imageColor: '#1a1a24' },
    { id: 5, title: 'Vybez Logo Pendant', category: 'Accessories', price: '49.99€', isNew: false, imageColor: '#201520' },
    { id: 6, title: 'Heavyweight Zip-Up', category: 'Hoodies', price: '79.99€', isNew: false, imageColor: '#11151a' },
  ];

  const filteredMerch = selectedCategory === 'All' 
    ? merchData 
    : merchData.filter(item => item.category === selectedCategory);

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      
      {/* 1. MERCH HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,0,127,0.1) 0%, rgba(20,0,40,0.8) 100%)',
          borderRadius: '30px',
          padding: '100px 40px',
          textAlign: 'center',
          marginBottom: '60px',
          border: '1px solid rgba(255,0,127,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'var(--accent-magenta)', filter: 'blur(200px)', opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ color: 'var(--accent-magenta)', fontWeight: '800', letterSpacing: '4px', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>Season 2026</span>
          <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: '900', letterSpacing: '-2px', marginBottom: '16px', lineHeight: 1 }}>
            OFFICIAL <br/><span className="text-gradient">APPAREL</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Εκπροσώπησε το vibe. Premium streetwear για παραγωγούς και καλλιτέχνες.</p>
        </div>
      </motion.div>

      {/* 2. EXCLUSIVE DROP SPOTLIGHT */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass-card"
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '0', 
          marginBottom: '80px', 
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.1)' 
        }}
      >
        <div style={{ flex: '1 1 400px', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-block', background: 'var(--accent-magenta)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '24px', alignSelf: 'flex-start' }}>LIMITED EDITION</div>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '16px', lineHeight: 1.1 }}>"THE DARK<br/>ROOM" JACKET</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>Μόνο 50 κομμάτια διαθέσιμα παγκοσμίως. Premium δέρμα, κεντημένο λογότυπο.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem', fontWeight: '900' }}>149.99€</span>
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              PRE-ORDER <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div style={{ flex: '1 1 400px', height: '100%', minHeight: '400px', background: 'radial-gradient(circle, #2a2a35 0%, #0a0a0f 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {/* Placeholder for the jacket image */}
          <div style={{ position: 'absolute', width: '80%', height: '80%', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <ShoppingBag size={64} />
          </div>
        </div>
      </motion.div>

      {/* 3. CATEGORY FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '12px 32px',
                borderRadius: '100px',
                background: selectedCategory === category ? 'white' : 'rgba(255,255,255,0.05)',
                color: selectedCategory === category ? 'black' : 'var(--text-secondary)',
                border: selectedCategory === category ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PRODUCT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px', marginBottom: '100px' }}>
        {filteredMerch.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="merch-card"
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          >
            {/* Image Box */}
            <div 
              style={{ 
                width: '100%', 
                aspectRatio: '4/5', 
                background: item.imageColor, 
                borderRadius: '24px', 
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.querySelector('.merch-overlay').style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.querySelector('.merch-overlay').style.opacity = '0'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {item.isNew && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'white', color: 'black', padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '900', zIndex: 2 }}>NEW</div>
              )}
              
              <ShoppingBag size={48} color="rgba(255,255,255,0.1)" />

              {/* Hover Overlay */}
              <div 
                className="merch-overlay"
                style={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  opacity: 0, transition: 'all 0.3s ease', zIndex: 1
                }}
              >
                <button className="btn-outline" style={{ background: 'white', color: 'black', borderColor: 'white', fontWeight: '800' }}>
                  SELECT SIZE
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div style={{ padding: '0 8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.category}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', lineHeight: 1.3 }}>{item.title}</h3>
                <span style={{ fontSize: '1.1rem', fontWeight: '900' }}>{item.price}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 5. MERCH NEWSLETTER */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '30px',
          padding: '80px 40px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <h3 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px' }}>MERCH DROP ALERTS</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>Τα καλύτερα κομμάτια μας γίνονται sold out σε λίγες ώρες. Γράψου για να ειδοποιηθείς πρώτος.</p>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <input 
            type="email" 
            placeholder="Το email σου..." 
            style={{ 
              width: '100%', padding: '20px 160px 20px 24px', borderRadius: '100px', 
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', 
              color: 'white', outline: 'none', fontSize: '1.1rem', fontFamily: 'inherit'
            }}
            onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'white'; }}
            onBlur={(e) => { e.target.style.background = 'rgba(0,0,0,0.5)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
          <button 
            style={{ 
              position: 'absolute', right: '6px', top: '6px', bottom: '6px',
              background: 'white', color: 'black', border: 'none', borderRadius: '100px',
              padding: '0 32px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
             SUBSCRIBE
          </button>
        </div>
      </motion.div>

    </div>
  );
}

export default Store;
