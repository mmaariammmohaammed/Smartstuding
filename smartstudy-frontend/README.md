# SmartStudy Frontend

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend server running

### Installation

```bash
# Install dependencies
npm install

# Set up environment
# Create .env file:
VITE_API_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

### Features
- ✅ React 18 with TypeScript
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Zustand state management
- ✅ React Query for server state
- ✅ React Router v6
- ✅ Recharts for analytics
- ✅ Lucide icons
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Protected routes
- ✅ JWT token refresh

### Project Structure
```
src/
  components/       # Reusable UI components
    layout/         # Sidebar, Header, Layout
  pages/            # Page components
    auth/           # Login, Register
    dashboard/      # Dashboard
    subjects/       # Subject management
    tasks/          # Task management
    study-plans/    # Study plans
    pomodoro/       # Pomodoro timer
    calendar/       # Calendar
    analytics/      # Analytics
    settings/       # Settings
  services/         # API services
  store/            # Zustand stores
  types/            # TypeScript types
  lib/              # Utilities
```

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
