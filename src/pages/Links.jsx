import React from 'react';
import { ShoppingBag, Music, Globe, Play, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function Links() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', background: '#020203', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Insane Background Effects */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'var(--accent-magenta)', filter: 'blur(150px)', opacity: 0.15, pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'var(--accent-violet)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none', zIndex: 0, borderRadius: '50%' }}></div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Profile Avatar with Pulse */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ position: 'relative', marginBottom: '32px' }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '140px', height: '140px', borderRadius: '50%', background: 'var(--accent-magenta)', filter: 'blur(30px)', opacity: 0.4 }}></div>
          <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=300&auto=format&fit=crop) center/cover', border: '4px solid #fff', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', zIndex: 2 }}></div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-1px', color: 'white', textShadow: '0 4px 20px rgba(255,255,255,0.2)' }}
        >
          BLACK VYBEZ
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '40px', letterSpacing: '2px' }}
        >
          MUSIC • BEATS • APPAREL
        </motion.p>

        {/* Hero Link (Massive Spotlight) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ width: '100%', marginBottom: '24px' }}>
           <a href="/releases" style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.15)', background: 'linear-gradient(135deg, rgba(255,0,127,0.2) 0%, rgba(20,0,40,0.8) 100%)', boxShadow: '0 30px 60px rgba(255,0,127,0.2)' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'url(https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop) center/cover', opacity: 0.2, mixBlendMode: 'overlay' }}></div>
             <div style={{ padding: '50px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
               <span style={{ background: 'white', color: 'black', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '16px' }}>NEW RELEASE</span>
               <h2 style={{ color: 'white', fontSize: '3rem', fontWeight: '900', marginBottom: '8px', textShadow: '0 4px 15px rgba(0,0,0,0.6)' }}>"JAZZ BAR"</h2>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '900', marginTop: '16px', fontSize: '1.1rem', background: 'rgba(0,0,0,0.5)', padding: '12px 24px', borderRadius: '100px', backdropFilter: 'blur(5px)' }}>
                 ΑΓΟΡΑ BUNDLE <ArrowRight size={20} />
               </div>
             </div>
           </a>
        </motion.div>

        {/* Links Grid (2 columns for some, full width for others) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
          
          {[
            { label: "Apple Music", icon: <Music size={28} />, url: "#", delay: 0.5 },
            { label: "Spotify", icon: <Play size={28} />, url: "#", delay: 0.55 },
            { label: "Merch Store", icon: <ShoppingBag size={28} />, url: "/store", full: true, delay: 0.6 },
            { label: "Official Site", icon: <Globe size={28} />, url: "/", delay: 0.65 },
            { label: "Beats Catalog", icon: <Star size={28} />, url: "/beats", delay: 0.7 }
          ].map((link, idx) => (
            <motion.a 
              key={idx}
              href={link.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: link.delay }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                gridColumn: link.full ? '1 / -1' : 'auto',
                display: 'flex', 
                flexDirection: link.full ? 'row' : 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: link.full ? '16px' : '16px',
                padding: link.full ? '24px' : '40px 16px', 
                textDecoration: 'none', 
                color: 'white', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '24px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ color: link.full ? 'var(--accent-magenta)' : 'white' }}>{link.icon}</div>
              <span style={{ fontWeight: '800', fontSize: link.full ? '1.3rem' : '1.1rem', letterSpacing: '0.5px' }}>{link.label}</span>
            </motion.a>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ marginTop: '80px', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', letterSpacing: '6px', fontWeight: '900' }}>
          VYBEZVERSE
        </motion.div>
      </div>
    </div>
  );
}

export default Links;
