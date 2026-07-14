import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <NavLink to="/" className="nav-logo">
          BLACK VYBEZ
        </NavLink>

        {/* Mobile hamburger */}
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${mobileOpen ? 'nav-open' : ''}`}>
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} onClick={() => setMobileOpen(false)}>HOME</NavLink>
          <NavLink to="/releases" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} onClick={() => setMobileOpen(false)}>RELEASES</NavLink>
          <NavLink to="/beats" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} onClick={() => setMobileOpen(false)}>BEATS</NavLink>
          <NavLink to="/store" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} onClick={() => setMobileOpen(false)}>STORE</NavLink>
          <NavLink to="/gallery" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} onClick={() => setMobileOpen(false)}>GALLERY</NavLink>
          
          {/* MORE Dropdown */}
          <div 
            className="nav-dropdown" 
            onMouseEnter={() => setMoreOpen(true)} 
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button className="nav-link nav-more-btn" onClick={() => setMoreOpen(!moreOpen)}>
              MORE <ChevronDown size={16} className={`more-chevron ${moreOpen ? 'rotated' : ''}`} />
            </button>
            {moreOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-menu-inner">
                  <NavLink to="/bio" className="dropdown-item" onClick={() => { setMoreOpen(false); setMobileOpen(false); }}>BIO</NavLink>
                  <NavLink to="/blog" className="dropdown-item" onClick={() => { setMoreOpen(false); setMobileOpen(false); }}>BLOG</NavLink>
                  <NavLink to="/links" className="dropdown-item" onClick={() => { setMoreOpen(false); setMobileOpen(false); }}>LINKS</NavLink>
                  <NavLink to="/podcasts" className="dropdown-item" onClick={() => { setMoreOpen(false); setMobileOpen(false); }}>PODCASTS</NavLink>
                  <NavLink to="/press" className="dropdown-item" onClick={() => { setMoreOpen(false); setMobileOpen(false); }}>PRESS</NavLink>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="nav-link nav-account-btn" 
            onClick={() => {
              setMobileOpen(false);
              navigate('/account');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <User size={18} /> ACCOUNT
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
