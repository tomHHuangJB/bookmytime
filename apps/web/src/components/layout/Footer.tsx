import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>BookMyTime</h3>
            <p>Your Time, Perfectly Booked</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} BookMyTime Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

