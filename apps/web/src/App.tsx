import { useState, useEffect } from 'react'
import './App.css'

interface SystemStatus {
  frontend: string;
  backend: string;
  database: string;
  search: string;
}

function App() {
  const [status, setStatus] = useState<SystemStatus>({
    frontend: 'Checking...',
    backend: 'Checking...',
    database: 'Not connected',
    search: 'Not connected'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check backend connection
    fetch('/api/health')
      .then(res => res.text())
      .then(data => {
        setStatus(prev => ({ ...prev, backend: '✅ Connected' }));
        setMessage(data);
      })
      .catch(() => {
        setStatus(prev => ({ ...prev, backend: '❌ Not connected' }));
      });

    // Check frontend
    setStatus(prev => ({ ...prev, frontend: '✅ Running on port 5173' }));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 BookMyTime Development Dashboard</h1>
        <p>Professional scheduling platform for tutors and service providers</p>
      </header>

      <main className="main">
        <section className="status-section">
          <h2>System Status</h2>
          <div className="status-grid">
            <div className="status-card">
              <h3>Frontend</h3>
              <p className={status.frontend.includes('✅') ? 'status-success' : 'status-error'}>
                {status.frontend}
              </p>
              <small>Vite + React + TypeScript</small>
            </div>
            
            <div className="status-card">
              <h3>Backend API</h3>
              <p className={status.backend.includes('✅') ? 'status-success' : 'status-error'}>
                {status.backend}
              </p>
              <small>Spring Boot + Java 21</small>
            </div>
            
            <div className="status-card">
              <h3>Database</h3>
              <p className={status.database.includes('✅') ? 'status-success' : 'status-warning'}>
                {status.database}
              </p>
              <small>PostgreSQL 15</small>
            </div>
            
            <div className="status-card">
              <h3>Search Engine</h3>
              <p className={status.search.includes('✅') ? 'status-success' : 'status-warning'}>
                {status.search}
              </p>
              <small>OpenSearch 2.11</small>
            </div>
          </div>
        </section>

        <section className="message-section">
          <h2>Backend Response</h2>
          <div className="message-box">
            <code>{message || 'Waiting for backend response...'}</code>
          </div>
        </section>

        <section className="quick-links">
          <h2>Quick Links</h2>
          <div className="links-grid">
            <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
              <div className="link-card">
                <h3>📱 Frontend App</h3>
                <p>React application</p>
                <small>http://localhost:5173</small>
              </div>
            </a>
            
            <a href="http://localhost:8080/api/health" target="_blank" rel="noopener noreferrer">
              <div className="link-card">
                <h3>⚙️ Backend API</h3>
                <p>Spring Boot REST API</p>
                <small>http://localhost:8080</small>
              </div>
            </a>
            
            <a href="http://localhost:8080/actuator" target="_blank" rel="noopener noreferrer">
              <div className="link-card">
                <h3>📊 Actuator</h3>
                <p>System metrics & health</p>
                <small>Spring Boot Actuator</small>
              </div>
            </a>
            
            <a href="#" onClick={(e) => {
              e.preventDefault();
              fetch('/api/health').then(r => r.text()).then(alert);
            }}>
              <div className="link-card">
                <h3>🔍 Test Connection</h3>
                <p>Click to test API</p>
                <small>Check backend status</small>
              </div>
            </a>
          </div>
        </section>

        <section className="next-steps">
          <h2>Next Development Steps</h2>
          <ol>
            <li><strong>Set up PostgreSQL database</strong> - Run Docker Compose</li>
            <li><strong>Create User model and API</strong> - JPA entities & REST endpoints</li>
            <li><strong>Implement authentication</strong> - JWT tokens with Spring Security</li>
            <li><strong>Build provider dashboard UI</strong> - React components</li>
            <li><strong>Create booking system</strong> - Calendar integration</li>
          </ol>
        </section>
      </main>

      <footer className="footer">
        <p>BookMyTime Inc. • Founded Today • Version 0.1.0</p>
        <p>Full-stack development in progress | Java + TypeScript</p>
      </footer>
    </div>
  )
}

export default App
