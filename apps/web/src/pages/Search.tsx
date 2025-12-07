import React, { useState, useEffect } from 'react';
import { searchApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { Provider, SearchFilters } from '../types';
import './Search.css';

export const Search: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    page: 0,
    size: 12,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await searchApi.searchProviders({
        ...filters,
        query: searchQuery || undefined,
      });
      setProviders(response.content);
    } catch (error) {
      console.error('Failed to load providers:', error);
      // For demo purposes, show mock data
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, query: searchQuery, page: 0 });
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>Find a Provider</h1>
          <p>Search for tutors, coaches, and consultants</p>
        </div>

        <div className="search-content">
          <aside className="search-sidebar">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="search-form">
                  <Input
                    label="Search"
                    placeholder="Name, specialty, language..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                  />
                  <Input
                    label="Min Rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.minRating || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, minRating: parseFloat(e.target.value) || undefined })
                    }
                    fullWidth
                  />
                  <Input
                    label="Max Price (per hour)"
                    type="number"
                    min="0"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: parseFloat(e.target.value) || undefined })
                    }
                    fullWidth
                  />
                  <div className="filter-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={filters.verifiedOnly || false}
                        onChange={(e) =>
                          setFilters({ ...filters, verifiedOnly: e.target.checked || undefined })
                        }
                      />
                      Verified providers only
                    </label>
                  </div>
                  <Button type="submit" variant="primary" fullWidth>
                    Apply Filters
                  </Button>
                </form>
              </CardContent>
            </Card>
          </aside>

          <main className="search-results">
            {loading ? (
              <div className="loading">Loading providers...</div>
            ) : providers.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="empty-state">
                    <p>No providers found. Try adjusting your filters.</p>
                    <p className="empty-state-note">
                      Note: This is a demo. Backend API integration is in progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="providers-grid">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const ProviderCard: React.FC<{ provider: Provider }> = ({ provider }) => {
  return (
    <Card className="provider-card">
      <CardContent>
        <div className="provider-header">
          {provider.profileImageUrl && (
            <img
              src={provider.profileImageUrl}
              alt={`${provider.firstName} ${provider.lastName}`}
              className="provider-avatar"
            />
          )}
          <div className="provider-info">
            <h3 className="provider-name">
              {provider.firstName} {provider.lastName}
            </h3>
            {provider.headline && <p className="provider-headline">{provider.headline}</p>}
            <div className="provider-rating">
              <span className="rating-stars">
                {'⭐'.repeat(Math.round(provider.rating))}
              </span>
              <span className="rating-value">{provider.rating.toFixed(1)}</span>
              <span className="rating-count">({provider.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
        {provider.bio && (
          <p className="provider-bio">{provider.bio.substring(0, 150)}...</p>
        )}
        <div className="provider-details">
          <div className="provider-detail">
            <strong>Rate:</strong> ${provider.hourlyRate.toFixed(2)}/{provider.currency} per hour
          </div>
          {provider.specialties && provider.specialties.length > 0 && (
            <div className="provider-tags">
              {provider.specialties.slice(0, 3).map((specialty) => (
                <span key={specialty} className="tag">
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="provider-actions">
          <Button
            variant="primary"
            fullWidth
            onClick={() => (window.location.href = `/providers/${provider.id}`)}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

