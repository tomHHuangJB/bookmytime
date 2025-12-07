// API service layer for backend communication

import type { User, UserRole, Provider, Service, AvailabilitySlot, Appointment, SearchFilters, SearchResponse } from '../types';

const API_BASE = '/api';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetchApi<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => {
    return fetchApi<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    return fetchApi<User>('/auth/me');
  },
};

// Provider endpoints
export const providerApi = {
  getProfile: async (id: string) => {
    return fetchApi<Provider>(`/providers/${id}`);
  },

  updateProfile: async (id: string, data: Partial<Provider>) => {
    return fetchApi<Provider>(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getServices: async (providerId: string) => {
    return fetchApi<Service[]>(`/providers/${providerId}/services`);
  },

  createService: async (providerId: string, data: Omit<Service, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Service>(`/providers/${providerId}/services`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAvailability: async (providerId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchApi<AvailabilitySlot[]>(`/providers/${providerId}/availability?${params}`);
  },

  createAvailability: async (providerId: string, data: Omit<AvailabilitySlot, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<AvailabilitySlot>(`/providers/${providerId}/availability`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Search endpoints
export const searchApi = {
  searchProviders: async (filters: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });
    return fetchApi<SearchResponse<Provider>>(`/search/providers?${params}`);
  },
};

// Appointment endpoints
export const appointmentApi = {
  create: async (data: {
    providerId: string;
    serviceId: string;
    slotId: string;
    clientNotes?: string;
  }) => {
    return fetchApi<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyAppointments: async () => {
    return fetchApi<Appointment[]>('/appointments/me');
  },

  getAppointment: async (id: string) => {
    return fetchApi<Appointment>(`/appointments/${id}`);
  },

  cancel: async (id: string, reason?: string) => {
    return fetchApi<Appointment>(`/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

