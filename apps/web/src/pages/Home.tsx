import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import './Home.css';

export const Home: React.FC = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Time, <span className="hero-highlight">Perfectly Booked</span>
          </h1>
          <p className="hero-subtitle">
            Connect with professional tutors, coaches, and consultants. 
            Schedule appointments seamlessly, manage your calendar, and grow your business.
          </p>
          <div className="hero-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = '/search')}
            >
              Find a Provider
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => (window.location.href = '/register')}
            >
              Become a Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose BookMyTime?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Smart Scheduling</h3>
              <p>Automated calendar management with timezone awareness and conflict detection.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Integrated payment processing with encrypted transactions and fraud protection.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>Multi-language support and international payment processing for worldwide clients.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Verified Providers</h3>
              <p>Trusted professionals with verified credentials and client reviews.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Track your bookings, revenue, and client engagement with detailed insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Client Management</h3>
              <p>Centralized client history, notes, and communication tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of professionals already using BookMyTime</p>
          <div className="cta-actions">
            <Button variant="primary" size="lg" onClick={() => (window.location.href = '/register')}>
              Sign Up Free
            </Button>
            <Link to="/search" className="cta-link">
              Browse Providers →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

