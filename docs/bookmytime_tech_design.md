# BookMyTime Technical Design Document

**Version:** 1.0  
**Date:** December 6, 2025  
**Status:** Draft  
**Author:** Engineering Team  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-06 | Engineering | Initial draft |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Architecture Design](#3-architecture-design)
4. [Data Model](#4-data-model)
5. [API Design](#5-api-design)
6. [Security Architecture](#6-security-architecture)
7. [Search & Analytics](#7-search--analytics)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [Performance & Scalability](#9-performance--scalability)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Development Guidelines](#11-development-guidelines)
12. [Testing Strategy](#12-testing-strategy)

---

## 1. Executive Summary

### 1.1 Purpose
This document describes the technical architecture and design for BookMyTime, a scheduling SaaS platform for service-based professionals.

### 1.2 Scope
- **In Scope:** Core scheduling, user management, search, payments, notifications
- **Out of Scope:** Mobile native apps (Phase 2), white-label (Phase 3)

### 1.3 Goals
- **Performance:** < 200ms API response time (p95)
- **Availability:** 99.9% uptime SLA
- **Scalability:** Support 10,000 concurrent users
- **Security:** SOC 2 compliant architecture
- **Accessibility:** WCAG 2.1 AA compliance

### 1.4 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | TypeScript + React | 18.x | UI/UX |
| Backend | Java + Spring Boot | 17 / 3.1 | Business logic |
| Database | PostgreSQL | 15.x | Primary data store |
| Search | OpenSearch | 2.11 | Full-text search |
| Cache | Redis | 7.x | Session & data caching |
| Infrastructure | AWS + Kubernetes | - | Hosting & orchestration |

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  • Web Browser (React SPA)                                   │
│  • Mobile Browser (PWA)                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      CDN Layer (CloudFront)                  │
│  • Static assets                                             │
│  • Edge caching                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer (AWS ALB)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer (Spring Boot)            │
│  • REST API                                                  │
│  • Business Logic                                            │
│  • Authentication/Authorization                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────┬──────────────────┬─────────────────────┐
│   PostgreSQL     │   OpenSearch     │      Redis          │
│  (Primary DB)    │   (Search)       │   (Cache/Session)   │
└──────────────────┴──────────────────┴─────────────────────┘
```

### 2.2 Core Components

#### 2.2.1 User Management Service
- Registration, authentication, authorization
- Profile management (provider/client)
- Role-based access control (RBAC)

#### 2.2.2 Scheduling Service
- Availability management
- Booking creation/modification
- Calendar synchronization
- Timezone handling

#### 2.2.3 Search Service
- Provider discovery
- Real-time search with filters
- Geolocation-based search

#### 2.2.4 Payment Service
- Stripe/PayPal integration
- Subscription management
- Invoice generation

#### 2.2.5 Notification Service
- Email notifications (SendGrid)
- SMS reminders (Twilio)
- In-app notifications

#### 2.2.6 Analytics Service
- User behavior tracking
- Business metrics
- Dashboard data aggregation

---

## 3. Architecture Design

### 3.1 Backend Architecture (Spring Boot)

```
┌───────────────────────────────────────────────────────────┐
│                     Spring Boot Application                │
├───────────────────────────────────────────────────────────┤
│  Controller Layer                                          │
│  • REST Controllers (@RestController)                     │
│  • Request validation (@Valid)                            │
│  • Exception handling (@ControllerAdvice)                 │
├───────────────────────────────────────────────────────────┤
│  Service Layer                                             │
│  • Business logic (@Service)                              │
│  • Transaction management (@Transactional)                │
│  • Event publishing                                        │
├───────────────────────────────────────────────────────────┤
│  Repository Layer                                          │
│  • Spring Data JPA (PostgreSQL)                           │
│  • Spring Data OpenSearch                                 │
│  • Query optimization                                      │
├───────────────────────────────────────────────────────────┤
│  Integration Layer                                         │
│  • External APIs (Stripe, SendGrid, Calendar)             │
│  • Message queues (SQS)                                   │
│  • CDC (Debezium → OpenSearch)                            │
└───────────────────────────────────────────────────────────┘
```

### 3.2 Frontend Architecture (React + TypeScript)

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Buttons, inputs, modals
│   ├── booking/        # Booking-specific components
│   └── profile/        # Profile components
├── pages/              # Route-level components
│   ├── HomePage/
│   ├── SearchPage/
│   ├── BookingPage/
│   └── DashboardPage/
├── hooks/              # Custom React hooks
├── services/           # API client services
├── store/              # State management (Redux/Context)
├── utils/              # Utilities, helpers
├── types/              # TypeScript type definitions
└── i18n/               # Internationalization files
```

### 3.3 Database Architecture

#### 3.3.1 PostgreSQL Schema Design

**Core Tables:**
- `users` - User accounts (both providers and clients)
- `providers` - Provider-specific data
- `clients` - Client-specific data
- `availability` - Provider availability slots
- `bookings` - Appointment bookings
- `payments` - Payment transactions
- `reviews` - Ratings and reviews
- `notifications` - Notification queue

**Design Principles:**
- Third Normal Form (3NF) normalization
- Foreign key constraints for referential integrity
- Indexes on frequently queried columns
- Soft deletes for audit trail

### 3.4 Search Architecture (OpenSearch)

#### 3.4.1 Data Synchronization (CDC)

```
PostgreSQL → Debezium → Kafka → OpenSearch
```

**Flow:**
1. Application writes to PostgreSQL
2. Debezium captures change events from WAL
3. Events published to Kafka topics
4. OpenSearch connector consumes and indexes

#### 3.4.2 OpenSearch Indices

**provider_index:**
```json
{
  "mappings": {
    "properties": {
      "provider_id": {"type": "keyword"},
      "name": {"type": "text", "analyzer": "standard"},
      "bio": {"type": "text"},
      "specializations": {"type": "keyword"},
      "languages": {"type": "keyword"},
      "rating": {"type": "float"},
      "hourly_rate": {"type": "float"},
      "location": {"type": "geo_point"},
      "availability": {"type": "nested"}
    }
  }
}
```

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│    Users     │         │  Providers   │
├──────────────┤         ├──────────────┤
│ id (PK)      │────────<│ user_id (FK) │
│ email        │         │ specialization│
│ password_hash│         │ hourly_rate  │
│ role         │         │ bio          │
│ created_at   │         │ rating       │
└──────────────┘         └──────────────┘
       │                        │
       │                        │
       ↓                        ↓
┌──────────────┐         ┌──────────────┐
│   Clients    │         │ Availability │
├──────────────┤         ├──────────────┤
│ user_id (FK) │         │ id (PK)      │
│ timezone     │         │ provider_id  │
│ preferences  │         │ day_of_week  │
└──────────────┘         │ start_time   │
                         │ end_time     │
                         └──────────────┘
       │                        │
       └────────┬───────────────┘
                ↓
         ┌──────────────┐
         │   Bookings   │
         ├──────────────┤
         │ id (PK)      │
         │ client_id    │
         │ provider_id  │
         │ start_time   │
         │ end_time     │
         │ status       │
         │ payment_id   │
         └──────────────┘
                ↓
         ┌──────────────┐
         │   Payments   │
         ├──────────────┤
         │ id (PK)      │
         │ booking_id   │
         │ amount       │
         │ status       │
         │ stripe_id    │
         └──────────────┘
```

### 4.2 Core Entities

#### 4.2.1 User Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    private UserRole role; // PROVIDER, CLIENT, ADMIN
    
    private String firstName;
    private String lastName;
    private String timezone;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime deletedAt; // Soft delete
}
```

#### 4.2.2 Provider Entity

```java
@Entity
@Table(name = "providers")
public class Provider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @ElementCollection
    private List<String> specializations;
    
    @ElementCollection
    private List<String> languages;
    
    private BigDecimal hourlyRate;
    
    private Double rating;
    private Integer totalReviews;
    
    @Column(columnDefinition = "jsonb")
    private String metadata; // Flexible JSON field
}
```

#### 4.2.3 Booking Entity

```java
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;
    
    @ManyToOne
    @JoinColumn(name = "provider_id")
    private Provider provider;
    
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    
    @Enumerated(EnumType.STRING)
    private BookingStatus status; // PENDING, CONFIRMED, CANCELLED, COMPLETED
    
    @OneToOne(mappedBy = "booking")
    private Payment payment;
    
    private String notes;
    private String videoCallLink;
}
```

---

## 5. API Design

### 5.1 RESTful API Principles

- **Base URL:** `https://api.bookmytime.com/v1`
- **Authentication:** JWT Bearer tokens
- **Content Type:** `application/json`
- **Versioning:** URL path versioning (`/v1`, `/v2`)

### 5.2 API Endpoints

#### 5.2.1 Authentication

```
POST   /auth/register          Register new user
POST   /auth/login             Login and get JWT
POST   /auth/refresh           Refresh access token
POST   /auth/logout            Logout (invalidate token)
POST   /auth/forgot-password   Request password reset
POST   /auth/reset-password    Reset password with token
```

#### 5.2.2 User Management

```
GET    /users/me               Get current user profile
PUT    /users/me               Update current user
DELETE /users/me               Delete account (soft delete)
GET    /users/{id}             Get user by ID (public info)
```

#### 5.2.3 Provider Management

```
GET    /providers              Search providers (with filters)
GET    /providers/{id}         Get provider details
POST   /providers              Create provider profile
PUT    /providers/{id}         Update provider profile
GET    /providers/{id}/availability  Get availability
PUT    /providers/{id}/availability  Update availability
GET    /providers/{id}/reviews       Get reviews
```

#### 5.2.4 Booking Management

```
POST   /bookings               Create new booking
GET    /bookings               List user's bookings
GET    /bookings/{id}          Get booking details
PUT    /bookings/{id}          Update booking
DELETE /bookings/{id}          Cancel booking
POST   /bookings/{id}/confirm  Confirm booking (provider)
```

#### 5.2.5 Payment Management

```
POST   /payments               Create payment intent
GET    /payments/{id}          Get payment details
POST   /payments/{id}/refund   Refund payment
GET    /payments/history       Payment history
```

### 5.3 Request/Response Examples

#### 5.3.1 Search Providers

**Request:**
```http
GET /v1/providers?specialization=language_tutor&language=english&rating_min=4.5&page=1&size=20
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "data": [
    {
      "id": 123,
      "userId": 456,
      "name": "John Smith",
      "bio": "Experienced English tutor...",
      "specializations": ["language_tutor", "business_english"],
      "languages": ["english", "spanish"],
      "hourlyRate": 45.00,
      "rating": 4.8,
      "totalReviews": 127,
      "availability": {
        "nextAvailable": "2025-12-10T14:00:00Z",
        "timezone": "America/New_York"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### 5.3.2 Create Booking

**Request:**
```http
POST /v1/bookings
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "providerId": 123,
  "startTime": "2025-12-10T14:00:00Z",
  "endTime": "2025-12-10T15:00:00Z",
  "notes": "First lesson, beginner level",
  "timezone": "America/Los_Angeles"
}
```

**Response:**
```json
{
  "data": {
    "id": 789,
    "providerId": 123,
    "clientId": 456,
    "startTime": "2025-12-10T14:00:00Z",
    "endTime": "2025-12-10T15:00:00Z",
    "status": "PENDING",
    "paymentRequired": true,
    "amount": 45.00,
    "currency": "USD",
    "paymentUrl": "https://checkout.stripe.com/..."
  }
}
```

### 5.4 Error Handling

**Standard Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "startTime",
        "message": "Start time must be in the future"
      }
    ],
    "timestamp": "2025-12-06T10:30:00Z",
    "path": "/v1/bookings"
  }
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET request
- `201 Created` - Successful POST creating resource
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., time slot taken)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

#### 6.1.1 JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id_123",
    "email": "user@example.com",
    "role": "PROVIDER",
    "iat": 1701864000,
    "exp": 1701950400
  }
}
```

**Token Lifecycle:**
- **Access Token:** 15 minutes expiry
- **Refresh Token:** 7 days expiry
- **Storage:** HttpOnly cookies (web), Secure storage (mobile)

#### 6.1.2 Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/providers").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 6.2 Data Security

#### 6.2.1 Encryption
- **At Rest:** AWS RDS encryption, EBS encryption
- **In Transit:** TLS 1.3 for all communications
- **Passwords:** BCrypt hashing (cost factor 12)
- **PII:** Application-level encryption for sensitive fields

#### 6.2.2 Data Access Controls
```java
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @JsonIgnore // Never expose in API
    private String passwordHash;
    
    @Column(columnDefinition = "TEXT")
    private String encryptedSsn; // Encrypted PII
    
    @CreatedBy
    private String createdBy;
    
    @LastModifiedBy
    private String lastModifiedBy;
}
```

### 6.3 API Security

#### 6.3.1 Rate Limiting
```java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    
    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) {
        String clientId = getClientIdentifier(request);
        
        if (rateLimiter.isAllowed(clientId, MAX_REQUESTS_PER_MINUTE)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.getWriter().write("Rate limit exceeded");
        }
    }
}
```

#### 6.3.2 Input Validation
```java
@PostMapping("/bookings")
public ResponseEntity<BookingResponse> createBooking(
    @Valid @RequestBody BookingRequest request
) {
    // @Valid triggers validation
}

public class BookingRequest {
    @NotNull
    private Long providerId;
    
    @Future
    private ZonedDateTime startTime;
    
    @Size(max = 500)
    private String notes;
}
```

### 6.4 Compliance

- **GDPR:** Data export, right to deletion, consent management
- **PCI DSS:** No credit card storage, Stripe handles payments
- **WCAG 2.1 AA:** Accessibility compliance
- **SOC 2:** Security controls and audit trail

---

## 7. Search & Analytics

### 7.1 OpenSearch Configuration

#### 7.1.1 Index Settings
```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "autocomplete": {
          "tokenizer": "autocomplete_tokenizer",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "autocomplete_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": ["letter", "digit"]
        }
      }
    }
  }
}
```

#### 7.1.2 Search Query Example
```java
@Service
public class ProviderSearchService {
    
    public SearchResponse searchProviders(ProviderSearchRequest request) {
        BoolQueryBuilder query = QueryBuilders.boolQuery();
        
        // Full-text search on name and bio
        if (request.getKeyword() != null) {
            query.must(QueryBuilders.multiMatchQuery(
                request.getKeyword(),
                "name", "bio"
            ).type(MultiMatchQueryBuilder.Type.BEST_FIELDS));
        }
        
        // Filter by specialization
        if (request.getSpecialization() != null) {
            query.filter(QueryBuilders.termQuery(
                "specializations",
                request.getSpecialization()
            ));
        }
        
        // Filter by rating
        if (request.getMinRating() != null) {
            query.filter(QueryBuilders.rangeQuery("rating")
                .gte(request.getMinRating()));
        }
        
        // Geo-distance filter
        if (request.getLocation() != null) {
            query.filter(QueryBuilders.geoDistanceQuery("location")
                .point(request.getLocation().getLat(), request.getLocation().getLon())
                .distance(request.getRadius(), DistanceUnit.KILOMETERS));
        }
        
        return elasticsearchClient.search(query, Provider.class);
    }
}
```

### 7.2 Analytics Architecture

#### 7.2.1 Event Tracking
```java
@Service
public class AnalyticsService {
    
    public void trackEvent(AnalyticsEvent event) {
        // Publish to OpenSearch for aggregation
        eventRepository.save(event);
        
        // Real-time metrics to Redis
        redisTemplate.opsForHash().increment(
            "metrics:" + event.getType(),
            event.getDate().toString(),
            1
        );
    }
}
```

#### 7.2.2 Dashboard Queries
```java
// Aggregation: Bookings per day
SearchRequest searchRequest = new SearchRequest("bookings");
DateHistogramAggregationBuilder aggregation = 
    AggregationBuilders
        .dateHistogram("bookings_per_day")
        .field("created_at")
        .calendarInterval(DateHistogramInterval.DAY);

searchRequest.source().aggregation(aggregation);
```

---

## 8. Infrastructure & Deployment

### 8.1 AWS Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              CloudFront (CDN + WAF)                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│         Application Load Balancer (Multi-AZ)             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 EKS Cluster (Kubernetes)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Spring Boot │  │  Spring Boot │  │  Spring Boot │ │
│  │   Pod 1      │  │   Pod 2      │  │   Pod 3      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────┬────────────────────┬───────────────────┐
│   RDS        │   OpenSearch       │    ElastiCache    │
│ (PostgreSQL) │   Cluster          │    (Redis)        │
│  Multi-AZ    │   3 nodes          │    Multi-AZ       │
└──────────────┴────────────────────┴───────────────────┘
```

### 8.2 Kubernetes Deployment

#### 8.2.1 Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookmytime-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bookmytime-api
  template:
    metadata:
      labels:
        app: bookmytime-api
    spec:
      containers:
      - name: api
        image: bookmytime/api:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
```

### 8.3 CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run tests
        run: ./mvnw test
      - name: Run integration tests
        run: ./mvnw verify
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t bookmytime/api:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin
          docker push bookmytime/api:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Update Kubernetes deployment
        run: |
          kubectl set image deployment/bookmytime-api \
            api=bookmytime/api:${{ github.sha }}
      - name: Wait for rollout
        run: kubectl rollout status deployment/bookmytime-api
```

### 8.4 Environment Configuration

**Development:**
- Single instance
- SQLite or local PostgreSQL
- Local OpenSearch
- No CDN

**Staging:**
- 2 instances
- RDS (t3.medium)
- OpenSearch (3 nodes, t3.small)
- CloudFront enabled

**Production:**
- 3+ instances (auto-scaling)
- RDS (r6g.xlarge, Multi-AZ)
- OpenSearch (3 nodes, r6g.large)
- CloudFront + WAF
- 99.9% SLA

---

## 9. Performance & Scalability

### 9.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p50) | < 100ms | CloudWatch |
| API Response Time (p95) | < 200ms | CloudWatch |
| API Response Time (p99) | < 500ms | CloudWatch |
| Database Query Time | < 50ms | Slow query log |
| Search Response Time | < 100ms | OpenSearch metrics |
| Page Load Time | < 2s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |

### 9.2 Caching Strategy

#### 9.2.1 Redis Cache Layers

```java
@Service
public class ProviderService {
    
    @Cacheable(value = "providers", key = "#id")
    public Provider getProvider(Long id) {
        return providerRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Provider not found"));
    }
    
    @CacheEvict(value = "providers", key = "#provider.id")
    public Provider updateProvider(Provider provider) {
        return providerRepository.save(provider);
    }
}
```

**Cache Configuration:**
```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 3600000 


#### 9.2.2 CDN Caching
- Static assets: 1 year TTL
- API responses (public): 5 minutes TTL
- Dynamic content: No cache

### 9.3 Database Optimization

#### 9.3.1 Indexing Strategy
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Booking queries
CREATE INDEX idx_bookings_provider_date ON bookings(provider_id, start_time);
CREATE INDEX idx_bookings_client_date ON bookings(client_id, start_time);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Provider search
CREATE INDEX idx_providers_rating ON providers(rating DESC);
CREATE INDEX idx_providers_hourly_rate ON providers(hourly_rate);

-- Composite index for common query
CREATE INDEX idx_bookings_provider_status_date 
    ON bookings(provider_id, status, start_time);
```

#### 9.3.2 Connection Pooling
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### 9.4 Horizontal Scaling

#### 9.4.1 Stateless Application Design
- No server-side sessions (JWT tokens)
- All state in database or cache
- Shared file storage (S3)

#### 9.4.2 Auto-Scaling Configuration
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bookmytime-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bookmytime-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 10. Monitoring & Observability

### 10.1 Logging Strategy

#### 10.1.1 Log Levels
- **ERROR:** Application errors, exceptions
- **WARN:** Degraded performance, deprecated API usage
- **INFO:** Business events (booking created, payment processed)
- **DEBUG:** Detailed debugging info (dev/staging only)

#### 10.1.2 Structured Logging
```java
@Slf4j
@RestController
public class BookingController {
    
    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        MDC.put("userId", SecurityUtils.getCurrentUserId());
        MDC.put("requestId", UUID.randomUUID().toString());
        
        try {
            log.info("Creating booking: providerId={}, startTime={}", 
                request.getProviderId(), request.getStartTime());
            
            Booking booking = bookingService.createBooking(request);
            
            log.info("Booking created successfully: bookingId={}", booking.getId());
            return ResponseEntity.ok(toResponse(booking));
            
        } catch (Exception e) {
            log.error("Failed to create booking", e);
            throw e;
        } finally {
            MDC.clear();
        }
    }
}
```

### 10.2 Metrics & Monitoring

#### 10.2.1 Application Metrics (Spring Boot Actuator)
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

**Custom Metrics:**
```java
@Component
public class BookingMetrics {
    private final MeterRegistry meterRegistry;
    
    public void recordBookingCreated(String providerType) {
        meterRegistry.counter("bookings.created", 
            "provider_type", providerType).increment();
    }
    
    public void recordBookingDuration(Duration duration) {
        meterRegistry.timer("bookings.duration").record(duration);
    }
}
```

#### 10.2.2 Infrastructure Metrics
- **CloudWatch:** EC2, RDS, EKS metrics
- **Prometheus:** Application metrics scraping
- **Grafana:** Dashboards and visualization

### 10.3 Alerting

#### 10.3.1 Alert Rules
```yaml
# Prometheus Alert Rules
groups:
- name: application
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "High error rate detected"
      
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
    for: 10m
    annotations:
      summary: "95th percentile response time > 500ms"
      
  - alert: DatabaseConnectionPoolExhausted
    expr: hikaricp_connections_active / hikaricp_connections_max > 0.9
    for: 5m
    annotations:
      summary: "Database connection pool near capacity"
```

### 10.4 Distributed Tracing
```java
// Using Spring Cloud Sleuth
@Service
@NewSpan
public class BookingService {
    
    @NewSpan("create-booking")
    public Booking createBooking(BookingRequest request) {
        // Trace ID automatically propagated
        Provider provider = providerService.getProvider(request.getProviderId());
        Payment payment = paymentService.processPayment(request);
        Booking booking = bookingRepository.save(toEntity(request));
        notificationService.sendConfirmation(booking);
        return booking;
    }
}
```

---

## 11. Development Guidelines

### 11.1 Code Standards

#### 11.1.1 Java Style Guide
- **Google Java Style Guide** compliance
- **Checkstyle** enforcement in build
- **SonarQube** for code quality
- **SpotBugs** for bug detection

#### 11.1.2 TypeScript/React Standards
- **ESLint** with Airbnb config
- **Prettier** for formatting
- **Husky** for pre-commit hooks
- **Jest** for unit testing

### 11.2 Git Workflow

#### 11.2.1 Branch Strategy (Git Flow)
main (production)
├── develop (staging)
│   ├── feature/booking-calendar
│   ├── feature/payment-integration
│   └── bugfix/timezone-handling
└── hotfix/critical-security-patch

#### 11.2.2 Commit Messages
<type>(<scope>): <subject>
<body>
<footer>
````
Example:
feat(booking): add recurring appointment support

- Implement daily/weekly/monthly recurrence patterns
- Add UI for selecting recurrence options
- Update database schema for recurrence rules

Closes #123
Types: feat, fix, docs, style, refactor, test, chore
11.3 Code Review Process

Create PR with description and linked issue
Automated checks: Tests, linting, coverage
Peer review: At least 1 approval required
Address feedback: Make changes as requested
Final approval: Tech lead sign-off
Merge: Squash and merge to develop

11.4 Documentation

API docs: OpenAPI/Swagger auto-generated
Code comments: JavaDoc for public APIs
Architecture decisions: ADR (Architecture Decision Records)
Runbooks: Operations documentation


12. Testing Strategy
12.1 Test Pyramid
        ┌────────────┐
        │    E2E     │  10%
        │ (Playwright)│
        └────────────┘
      ┌──────────────────┐
      │   Integration    │  20%
      │  (Spring Boot)   │
      └──────────────────┘
   ┌─────────────────────────┐
   │      Unit Tests          │  70%
   │  (JUnit + Jest)          │
   └─────────────────────────┘
12.2 Unit Testing
12.2.1 Backend (JUnit 5 + Mockito)
java@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    
    @Mock
    private BookingRepository bookingRepository;
    
    @Mock
    private ProviderService providerService;
    
    @InjectMocks
    private BookingService bookingService;
    
    @Test
    void createBooking_Success() {
        // Given
        BookingRequest request = createValidRequest();
        Provider provider = createMockProvider();
        when(providerService.getProvider(anyLong())).thenReturn(provider);
        when(bookingRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        
        // When
        Booking result = bookingService.createBooking(request);
        
        // Then
        assertNotNull(result);
        assertEquals(request.getProviderId(), result.getProvider().getId());
        verify(bookingRepository, times(1)).save(any());
    }
    
    @Test
    void createBooking_ProviderNotFound_ThrowsException() {
        // Given
        when(providerService.getProvider(anyLong()))
            .thenThrow(new NotFoundException("Provider not found"));
        
        // When & Then
        assertThrows(NotFoundException.class, 
            () -> bookingService.createBooking(createValidRequest()));
    }
}
12.2.2 Frontend (Jest + React Testing Library)
typescriptimport { render, screen, fireEvent } from '@testing-library/react';
import { BookingForm } from './BookingForm';

describe('BookingForm', () => {
  it('should render form fields', () => {
    render(<BookingForm />);
    
    expect(screen.getByLabelText(/provider/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    render(<BookingForm />);
    
    const submitButton = screen.getByRole('button', { name: /book/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/provider is required/i)).toBeInTheDocument();
  });
  
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/provider/i), { 
      target: { value: '123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /book/i }));
    
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      providerId: '123'
    }));
  });
});
12.3 Integration Testing
java@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
@Sql("/test-data.sql")
class BookingControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Test
    void createBooking_ValidRequest_ReturnsCreated() {
        // Given
        BookingRequest request = createValidRequest();
        
        // When
        ResponseEntity<BookingResponse> response = restTemplate
            .withBasicAuth("user@example.com", "password")
            .postForEntity("/api/v1/bookings", request, BookingResponse.class);
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getId());
        
        // Verify in database
        Booking saved = bookingRepository.findById(response.getBody().getId()).get();
        assertEquals(request.getProviderId(), saved.getProvider().getId());
    }
}
12.4 E2E Testing (Playwright)
typescriptimport { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete full booking process', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name=email]', 'client@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    
    // Search for provider
    await page.goto('/providers');
    await page.fill('[name=search]', 'English tutor');
    await page.click('button:has-text("Search")');
    
    // Select provider
    await page.click('.provider-card:first-child');
    
    // Book appointment
    await page.click('button:has-text("Book Appointment")');
    await page.selectOption('[name=date]', '2025-12-15');
    await page.selectOption('[name=time]', '14:00');
    await page.click('button:has-text("Confirm Booking")');
    
    // Verify confirmation
    await expect(page.locator('.booking-confirmation')).toBeVisible();
    await expect(page.locator('.booking-id')).toContainText(/BK-\d+/);
  });
});
12.5 Performance Testing
java@SpringBootTest
class PerformanceTest {
    
    @Autowired
    private BookingService bookingService;
    
    @Test
    void testBookingCreationPerformance() {
        StopWatch stopWatch = new StopWatch();
        
        stopWatch.start();
        for (int i = 0; i < 1000; i++) {
            bookingService.createBooking(createRequest());
        }
        stopWatch.stop();
        
        double avgTime = stopWatch.getTotalTimeMillis() / 1000.0;
        assertTrue(avgTime < 100, "Average booking creation time should be < 100ms");
    }
}
12.6 Test Coverage Requirements

Unit Tests: 80% code coverage minimum
Integration Tests: All API endpoints covered
E2E Tests: Critical user journeys covered
Performance Tests: Key operations benchmarked


Appendices
Appendix A: Glossary

Provider: Service professional offering appointments
Client: User booking appointments
Booking: Scheduled appointment between client and provider
Availability: Time slots when provider is available
CDC: Change Data Capture (database sync)

Appendix B: References

Spring Boot Documentation: https://spring.io/projects/spring-boot
PostgreSQL Documentation: https://www.postgresql.org/docs/
OpenSearch Documentation: https://opensearch.org/docs/
AWS Best Practices: https://aws.amazon.com/architecture/

Appendix C: Change Log
DateVersionChangesAuthor2025-12-061.0Initial documentEngineering

Document Approval
RoleNameSignatureDateTech Lead[Name]Engineering Manager[Name]Product Manager[Name]CTO[Name]Tcan you merge the discussion after 9.2.2 CDN Caching in the doc you created: BookMyTime Technical Design Document?BookMyTime - Technical Design DocumentDocument ∙ Version 2 

