# Authentication Flow & UI Design Plan

## 🔄 Authentication Flow Architecture

### Current State (localStorage)
```
User visits app → Habits loaded from localStorage → User can CRUD habits
```

### Target State (Google Auth + Database)
```
User visits app → Check auth status → 
├─ Not authenticated → Show login screen
└─ Authenticated → Load user's habits from database → Show habit interface
```

## 📱 Detailed Authentication Flow

### 1. Initial App Load
```mermaid
graph TD
    A[User visits app] --> B{Check auth session}
    B -->|No session| C[Show login screen]
    B -->|Valid session| D[Load user data from DB]
    D --> E[Show authenticated app]
    C --> F[User clicks "Sign in with Google"]
    F --> G[Redirect to Google OAuth]
    G --> H[Google auth callback]
    H --> I{Auth successful?}
    I -->|Yes| J[Create/update user in DB]
    I -->|No| K[Show error, back to login]
    J --> L{First time user?}
    L -->|Yes| M[Show migration prompt]
    L -->|No| D
    M --> N{Has localStorage data?}
    N -->|Yes| O[Migrate data to DB]
    N -->|No| P[Start fresh]
    O --> D
    P --> D
```

### 2. Session Management
- **Session Storage**: HTTP-only cookies for security
- **Session Duration**: 7 days with auto-refresh
- **Logout**: Clear session + redirect to login

### 3. Route Protection
- **Public routes**: `/login`, `/` (redirects to login if not authenticated)
- **Protected routes**: `/dashboard`, `/habits`, `/profile`
- **Middleware**: Check auth on every protected route

## 🎨 UI/UX Design Plan

### Login Screen Design
```
┌─────────────────────────────────────┐
│              HABIT TRACKER          │
│                                     │
│     🎯 Track your daily habits      │
│        Build better routines        │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  🔍 Sign in with Google        │ │
│  └─────────────────────────────────┘ │
│                                     │
│     Secure • Private • Synced      │
└─────────────────────────────────────┘
```

### Migration Prompt (for existing users)
```
┌─────────────────────────────────────┐
│         Welcome back! 👋            │
│                                     │
│  We found 5 habits in your browser │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  📤 Sync to Cloud              │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  🗑️  Start Fresh               │ │
│  └─────────────────────────────────┘ │
│                                     │
│     Your data will be safe!         │
└─────────────────────────────────────┘
```

### Authenticated App Header
```
┌─────────────────────────────────────┐
│ 🎯 Habits    👤 John D.  ⚙️  🚪     │
├─────────────────────────────────────┤
│                                     │
│        [Existing habit UI]          │
│                                     │
└─────────────────────────────────────┘
```

### User Profile/Settings Component
```
┌─────────────────────────────────────┐
│            Profile Settings         │
│                                     │
│  📧 john.doe@gmail.com             │
│  👤 John Doe                       │
│  📅 Member since: Dec 2024         │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  📊 Export Data                │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  🗑️  Delete Account            │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  🚪 Sign Out                   │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔧 Technical Implementation Plan

### Authentication State Management
```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Context provider for auth state
const AuthContext = createContext<AuthState>();
```

### Route Structure Changes
```
app/
├── routes/
│   ├── login.tsx           # Public login page
│   ├── auth.callback.tsx   # Google OAuth callback
│   ├── dashboard.tsx       # Protected main app (current home)
│   └── profile.tsx         # User settings
├── lib/
│   ├── auth/
│   │   ├── config.ts       # Auth configuration
│   │   ├── middleware.ts   # Route protection
│   │   └── session.ts      # Session management
└── components/
    ├── auth/
    │   ├── LoginForm.tsx
    │   ├── MigrationPrompt.tsx
    │   └── UserProfile.tsx
    └── ui/
        └── AuthButton.tsx
```

### Key Components to Build

1. **LoginForm.tsx** - Google sign-in button with branding
2. **AuthProvider.tsx** - Context provider for auth state
3. **ProtectedRoute.tsx** - Wrapper for authenticated routes
4. **MigrationPrompt.tsx** - localStorage → database migration UI
5. **UserProfile.tsx** - User settings and account management
6. **AuthButton.tsx** - Login/logout button for header

## 🎯 User Experience Goals

### Seamless Migration
- Detect existing localStorage data
- Offer clear migration options
- Preserve all user data
- No data loss scenarios

### Security First
- HTTP-only cookies
- CSRF protection
- Secure session management
- No sensitive data in localStorage

### Performance
- Fast authentication checks
- Optimistic UI updates
- Offline capability maintained
- Progressive enhancement

## 📋 Implementation Checklist

### Phase 2A: Core Authentication
- [ ] Install auth dependencies
- [ ] Set up Google OAuth app
- [ ] Create auth configuration
- [ ] Build login page
- [ ] Implement OAuth callback

### Phase 2B: Session & State Management  
- [ ] Create auth context provider
- [ ] Add session middleware
- [ ] Protect routes
- [ ] Add logout functionality

### Phase 2C: Migration & UI Polish
- [ ] Build migration prompt
- [ ] Create user profile component
- [ ] Update app header with auth state
- [ ] Add loading states and error handling