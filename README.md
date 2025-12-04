# DCTV Earn - Microtask Platform Frontend

A modern, feature-rich microtask platform built with React, TypeScript, and Vite. This platform connects workers with employers for digital task completion and earning opportunities.

## 🚀 Features

### For Workers
- Browse and complete digital tasks
- Submit task proofs with image uploads
- Track submission status and earnings
- Appeal rejected submissions
- Referral system to earn extra income
- Wallet management and withdrawals

### For Employers
- Create and manage tasks
- Review worker submissions
- Approve/reject submitted work
- Track campaign performance

### For Admins
- User management dashboard
- Task moderation
- Submission review system
- Appeals resolution
- Withdrawal processing
- Platform analytics

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon system
- **Tailwind CSS** - Utility-first CSS (via custom classes)

## 📦 Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm run dev
```

The app will run at `http://localhost:5173` (or another port if 5173 is busy).

## 🔧 Environment Setup

Create a `.env` or `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

Update this to point to your backend API server.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui.tsx          # Base UI components (Button, Input, Card, etc.)
│   ├── Toast.tsx       # Toast notification system
│   ├── Layout.tsx      # App layout wrapper
│   └── Logo.tsx        # App logo component
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin-specific pages
│   ├── employer/       # Employer-specific pages
│   ├── worker/         # Worker-specific pages
│   └── *.tsx           # Shared pages
├── services/
│   ├── api.ts          # API client with all endpoints
│   └── store.ts        # Mock data and utilities
├── context/            # React context providers
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main app component with routing
```

## 🔗 Available Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset
- `/verify-email` - Email verification

### Worker Routes
- `/dashboard` - Worker dashboard
- `/tasks` - Browse available tasks
- `/tasks/:id` - Task details and submission
- `/worker/submissions` - My submissions history
- `/referrals` - Referral management

### Employer Routes
- `/employer` - Employer dashboard
- `/employer/tasks/:id/review` - Review task submissions

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/users` - User management (embedded in dashboard)
- `/admin/tasks` - Task moderation
- `/admin/submissions` - Submission reviews
- `/admin/appeals` - Appeal resolution
- `/admin/withdrawals` - Withdrawal processing

### Shared Routes
- `/wallet` - Wallet and transactions
- `/profile` - User profile settings

## 🔌 Backend Integration

This frontend is designed to work with a RESTful API backend. All API endpoints are defined in `services/api.ts`.

**For backend developers**: See [`BACKEND_INTEGRATION.md`](../../BACKEND_INTEGRATION.md) for:
- Complete API endpoint specifications
- Request/response formats
- Authentication requirements
- Testing checklist

### API Client Usage

```typescript
import api from './services/api';

// Example: Get current user
const { user } = await api.getMe();

// Example: Create a task
const task = await api.createTask({
  title: "Download app and screenshot",
  reward: 500,
  totalSlots: 100
});

// Example: Approve submission
await api.approveSubmission(submissionId);
```

## 🎨 UI Components

The project uses custom-built UI components in `components/ui.tsx`:

- `<Button>` - Multiple variants and sizes
- `<Input>` - Text input with labels and icons
- `<Card>` - Content containers
- `<Badge>` - Status indicators
- `<StatCard>` - Dashboard statistics
- `<Select>` - Dropdown select
- `<Textarea>` - Multi-line text input

## 🚧 Development Status

### ✅ Completed
- All UI pages and components
- Admin dashboard (fully connected to API)
- Worker appeal system
- Employer dashboard (connected to API)
- Authentication flows
- Responsive design

### 🔄 Needs Backend Integration
The following pages use mock data and need backend API:
- Profile page (user updates)
- Task details (some features)
- Wallet (transactions display)
- Referrals (completely static)

See `BACKEND_INTEGRATION.md` for complete details.

## 🧪 Testing

To test the frontend with mock data:
1. Start the dev server: `npm run dev`
2. Navigate to different pages to see the UI
3. Note: Some features require backend API

To test with real backend:
1. Ensure backend is running
2. Update `VITE_API_URL` in `.env`
3. Test complete user flows

## 📝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Keep components modular and reusable
4. Update this README for significant changes

## 🔐 Authentication

The app uses JWT token-based authentication:
- Token stored in AuthContext
- Automatically attached to API requests via `api.ts`
- Protected routes wrapped in `<Layout>` component

## 🎯 Supabase Integration

Project configured for Supabase backend:
- **Project URL**: `https://kvzcnnainuuxpvfurmoj.supabase.co`
- **Anon Key**: (stored in environment/context)

## 📄 License

Private - Internal use for DCTV Earn platform

## 👥 Credits

Built for Decipher Tech Vision Africa