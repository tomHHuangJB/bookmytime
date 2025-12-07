import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import './Auth.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'CLIENT' as 'CLIENT' | 'PROVIDER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <p className="auth-subtitle">Join BookMyTime today</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-error" role="alert">{error}</div>}
              <div className="form-row">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  fullWidth
                  autoComplete="given-name"
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  fullWidth
                  autoComplete="family-name"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
                autoComplete="email"
              />
              <div className="form-group">
                <label className="form-label">I am a</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="CLIENT"
                      checked={formData.role === 'CLIENT'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CLIENT' | 'PROVIDER' })}
                    />
                    <span>Client (looking for services)</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="PROVIDER"
                      checked={formData.role === 'PROVIDER'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CLIENT' | 'PROVIDER' })}
                    />
                    <span>Provider (offering services)</span>
                  </label>
                </div>
              </div>
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                fullWidth
                autoComplete="new-password"
                helperText="Must be at least 8 characters"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                fullWidth
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={loading}
              >
                Create Account
              </Button>
            </form>
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

