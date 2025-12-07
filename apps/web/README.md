# BookMyTime Frontend

A modern, accessible React + TypeScript frontend for the BookMyTime scheduling platform.

## 🚀 Features

- **Modern React Architecture**: Built with React 19, TypeScript, and Vite
- **Professional UI Components**: Reusable, accessible components with WCAG 2.1 AA compliance
- **Routing**: React Router for navigation
- **API Integration**: Service layer ready for backend communication
- **Responsive Design**: Mobile-first, works on all devices
- **Type Safety**: Full TypeScript coverage

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   └── ui/              # Reusable UI components (Button, Input, Card, Modal)
├── pages/               # Page components
│   ├── Home.tsx         # Landing page
│   ├── Search.tsx       # Provider search page
│   ├── Login.tsx        # Login page
│   ├── Register.tsx     # Registration page
│   └── Dashboard.tsx    # User dashboard
├── services/            # API service layer
│   └── api.ts          # Backend API client
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component with routing
└── main.tsx            # Entry point
```

## 🎨 UI Components

### Core Components
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger) with loading states
- **Input**: Form inputs with validation, labels, and error messages
- **Card**: Flexible card component with header, content, and footer
- **Modal**: Accessible modal dialog with focus trap and keyboard navigation

### Layout Components
- **Header**: Navigation bar with authentication state
- **Footer**: Site footer with links
- **Layout**: Main layout wrapper

## 🛣️ Routes

- `/` - Home/Landing page
- `/search` - Provider search and discovery
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Protected user dashboard

## 🔌 API Integration

The frontend is ready to connect to the Spring Boot backend. API endpoints are defined in `src/services/api.ts`:

- **Auth API**: Login, register, get current user
- **Provider API**: Get/update profiles, manage services, availability
- **Search API**: Search providers with filters
- **Appointment API**: Create, view, cancel appointments

## 🎯 Key Features Implemented

### ✅ Completed
- [x] Project structure and routing
- [x] Core UI component library
- [x] Authentication pages (Login/Register)
- [x] Home/Landing page
- [x] Provider search page with filters
- [x] User dashboard
- [x] API service layer
- [x] TypeScript type definitions
- [x] Responsive design
- [x] Accessibility features (ARIA labels, keyboard navigation, focus management)

### 🚧 In Progress / Planned
- [ ] Provider profile management
- [ ] Availability calendar component
- [ ] Booking flow with calendar selection
- [ ] Internationalization (i18n)
- [ ] Advanced search filters
- [ ] Appointment management UI
- [ ] Review and rating system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running on port 8080

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

### Development

The frontend uses Vite's proxy to forward API requests to the backend:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  }
}
```

## 🎨 Styling

- **CSS Variables**: Theme colors and spacing defined in `index.css`
- **Component Styles**: Each component has its own CSS file
- **Responsive**: Mobile-first approach with media queries
- **Accessibility**: WCAG 2.1 AA compliant colors and contrast

## 🔒 Authentication

Authentication is handled via JWT tokens stored in localStorage. Protected routes check for the token and redirect to login if not authenticated.

## 📱 Responsive Design

The app is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1200px+)

## ♿ Accessibility

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- WCAG 2.1 AA color contrast

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npm run build
```

## 📝 Next Steps

1. **Connect to Backend**: Ensure backend API endpoints match the frontend service layer
2. **Add State Management**: Consider adding React Query or Zustand for complex state
3. **Internationalization**: Add i18n support for multiple languages
4. **Calendar Component**: Implement date/time picker for booking
5. **File Upload**: Add image upload for profile pictures
6. **Real-time Updates**: Consider WebSocket integration for live updates

## 🛠️ Tech Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **CSS3**: Styling with CSS variables

## 📄 License

Part of the BookMyTime project.
