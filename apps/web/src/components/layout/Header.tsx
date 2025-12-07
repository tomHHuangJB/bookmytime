import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import './Header.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = !!token;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="header-logo-icon">📅</span>
          <span className="header-logo-text">BookMyTime</span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <Link to="/search" className="header-nav-link">
            Find Providers
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="header-nav-link">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-nav-link">
                Login
              </Link>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

