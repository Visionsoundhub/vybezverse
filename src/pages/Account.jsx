import React from 'react';
import { User, LogOut, Disc, Music, Settings, Ticket, Crown, Mail, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

function Account() {
  return (
    <div style={{ paddingTop: '140px', paddingBottom: '100px', minHeight: '100vh', background: 'radial-gradient(ellipse at top, #110022 0%, #050508 60%)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Dashboard Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}
        >
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>MY DASHBOARD</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Welcome back, <strong style={{ color: 'white' }}>VYBEZ</strong></p>
          </div>
          <button className="btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center', borderColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px 24px', cursor: 'pointer' }}>
            <LogOut size={16} /> LOGOUT
          </button>
        </motion.div>

        {/* Top Section: Membership & Avatar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px', boxShadow: '0 10px 20px rgba(255,0,127,0.3)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              V
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px' }}>Vybez</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Mail size={14} /> blackvybez.official@gmail.com
            </div>
          </motion.div>

          {/* Membership Tier */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* Glowing background */}
            <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', background: 'var(--accent-magenta)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Star fill="var(--text-secondary)" color="var(--text-secondary)" size={20} />
                  <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Current Tier</span>
                </div>
                <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  STARTER <span style={{ fontSize: '1.1rem', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '100px', fontWeight: '800', color: 'white' }}>0% OFF</span>
                </h2>
              </div>
              <Crown size={50} color="var(--accent-magenta)" opacity={0.3} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Buy <strong>3 more beats</strong> to unlock BRONZE</span>
                <span style={{ color: 'var(--accent-magenta)', fontWeight: '900', letterSpacing: '1px' }}>BRONZE (10% OFF)</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }} style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: '100px', boxShadow: '0 0 10px rgba(255,0,127,0.5)' }}></motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* VIP Code */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-magenta)', fontWeight: '900' }}><Ticket size={20} /> VIP DISCOUNT CODE</h3>
            <div style={{ background: 'rgba(255,0,127,0.05)', border: '2px dashed rgba(255,0,127,0.3)', padding: '40px 24px', borderRadius: '16px', textAlign: 'center', position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>Use this secret code at the Payhip checkout to claim your tier discount.</p>
              <h2 style={{ fontSize: '3.5rem', color: 'white', letterSpacing: '6px', fontWeight: '900', textShadow: '0 0 30px rgba(255,0,127,0.4)', margin: 0 }}>VYBEZ26</h2>
            </div>
          </motion.div>

          {/* Collection Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* My Beats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Disc size={28} color="var(--accent-violet)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '4px' }}>My Beats</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>0 tracks purchased</span>
                </div>
              </div>
              <ChevronRight color="var(--text-secondary)" />
            </motion.div>

            {/* My Songs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Music size={28} color="#cd7f32" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '4px' }}>My Releases</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>0 items purchased</span>
                </div>
              </div>
              <ChevronRight color="var(--text-secondary)" />
            </motion.div>

            {/* Settings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Settings size={28} color="var(--text-secondary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '4px' }}>Account Settings</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Password, email, preferences</span>
                </div>
              </div>
              <ChevronRight color="var(--text-secondary)" />
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Account;
