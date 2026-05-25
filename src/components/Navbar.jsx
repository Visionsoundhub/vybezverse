import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <NavLink to="/" className="nav-logo">
          BLACK VYBEZ
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>HOME</NavLink>
          <NavLink to="/releases" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>RELEASES</NavLink>
          <NavLink to="/beats" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>BEATS</NavLink>
          <NavLink to="/store" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>STORE</NavLink>
          <NavLink to="/gallery" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>GALLERY</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
