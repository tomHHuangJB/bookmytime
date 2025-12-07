import React, { useState, useEffect } from 'react';
import { authApi, appointmentApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { User, Appointment } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadAppointments();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await appointmentApi.getMyAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  const isProvider = user?.role === 'PROVIDER';

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.firstName}!</h1>
            <p className="dashboard-subtitle">
              {isProvider ? 'Manage your services and appointments' : 'View and manage your bookings'}
            </p>
          </div>
          {isProvider && (
            <Button variant="primary" onClick={() => (window.location.href = '/dashboard/profile')}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="empty-state">
                    <p>No upcoming appointments</p>
                    {!isProvider && (
                      <Button
                        variant="primary"
                        onClick={() => (window.location.href = '/search')}
                        style={{ marginTop: '1rem' }}
                      >
                        Find a Provider
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="appointments-list">
                    {appointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="dashboard-sidebar">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="stats">
                  <div className="stat-item">
                    <div className="stat-value">{appointments.length}</div>
                    <div className="stat-label">Total Appointments</div>
                  </div>
                  {isProvider && (
                    <>
                      <div className="stat-item">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Active Services</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">0</div>
                        <div className="stat-label">Total Reviews</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {isProvider && (
              <Card style={{ marginTop: '1.5rem' }}>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="quick-actions">
                    <Button variant="outline" fullWidth onClick={() => (window.location.href = '/dashboard/services')}>
                      Manage Services
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => (window.location.href = '/dashboard/availability')}>
                      Set Availability
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div>
          <h4>
            {appointment.provider
              ? `${appointment.provider.firstName} ${appointment.provider.lastName}`
              : 'Provider'}
          </h4>
          {appointment.service && <p className="appointment-service">{appointment.service.title}</p>}
        </div>
        <span className={`appointment-status appointment-status--${appointment.status.toLowerCase()}`}>
          {appointment.status}
        </span>
      </div>
      {appointment.slot && (
        <div className="appointment-details">
          <p>
            <strong>Date:</strong>{' '}
            {new Date(appointment.slot.date).toLocaleDateString()} at{' '}
            {appointment.slot.startTime}
          </p>
          <p>
            <strong>Price:</strong> ${appointment.price.toFixed(2)} {appointment.currency}
          </p>
        </div>
      )}
      <div className="appointment-actions">
        <Button variant="outline" size="sm">
          View Details
        </Button>
        {appointment.status === 'CONFIRMED' && (
          <Button variant="danger" size="sm">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

