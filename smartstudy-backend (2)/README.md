# SmartStudy Backend

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (optional - safe fallback if missing)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smartstudy
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional - safe fallback if missing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Optional - safe fallback if missing
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register user |
| POST | /api/v1/auth/login | Login user |
| GET | /api/v1/auth/me | Get current user |
| POST | /api/v1/auth/logout | Logout user |
| GET | /api/v1/subjects | Get all subjects |
| POST | /api/v1/subjects | Create subject |
| GET | /api/v1/tasks | Get all tasks |
| POST | /api/v1/tasks | Create task |
| GET | /api/v1/study-plans | Get study plans |
| POST | /api/v1/study-plans | Create study plan |
| GET | /api/v1/pomodoro | Get pomodoro sessions |
| POST | /api/v1/pomodoro | Start session |
| GET | /api/v1/calendar | Get calendar events |
| POST | /api/v1/calendar | Create event |
| GET | /api/v1/analytics/dashboard | Get dashboard stats |
| POST | /api/v1/stripe/checkout | Create checkout |

### Features
- ✅ JWT Authentication with refresh tokens
- ✅ MongoDB with Mongoose ODM
- ✅ Input validation & sanitization
- ✅ Rate limiting & security headers
- ✅ Winston logging with rotation
- ✅ Stripe integration (safe fallback)
- ✅ Email service (safe fallback)
- ✅ AI-powered study planning
- ✅ Pomodoro timer tracking
- ✅ Analytics & insights

### Scripts
- `npm run dev` - Development with hot reload
- `npm run build` - Production build
- `npm start` - Production server
- `npm test` - Run tests
