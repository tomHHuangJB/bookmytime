// Core domain types for BookMyTime

export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  profileImageUrl?: string;
  timezone: string;
  locale: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Provider extends User {
  bio?: string;
  headline?: string;
  hourlyRate: number;
  currency: string;
  yearsExperience?: number;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  responseRate: number;
  responseTimeMinutes?: number;
  specialties?: string[];
  languages?: string[];
  certifications?: string[];
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  isAvailable: boolean;
  serviceId?: string;
  maxBookings: number;
  currentBookings: number;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  slotId: string;
  status: AppointmentStatus;
  price: number;
  currency: string;
  clientNotes?: string;
  providerNotes?: string;
  meetingUrl?: string;
  meetingPlatform?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  client?: User;
  provider?: Provider;
  service?: Service;
  slot?: AvailabilitySlot;
}

export interface Review {
  id: string;
  appointmentId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  languages?: string[];
  specialties?: string[];
  sortBy?: 'rating' | 'price' | 'reviews' | 'newest';
  page?: number;
  size?: number;
}

export interface SearchResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

