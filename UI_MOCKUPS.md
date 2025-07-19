# 🎨 Authentication UI Mockups & Components

## 1. Login Page Component

```tsx
// app/routes/login.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="mt-2 text-gray-600">Track your daily habits</p>
          <p className="text-sm text-gray-500">Build better routines</p>
        </div>
        
        <div className="space-y-4">
          <GoogleSignInButton />
          
          <div className="text-center text-xs text-gray-500">
            <p>🔒 Secure • 🔐 Private • ☁️ Synced</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 2. Google Sign-In Button

```tsx
// app/components/auth/GoogleSignInButton.tsx
export function GoogleSignInButton() {
  return (
    <button 
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        {/* Google logo SVG */}
      </svg>
      Sign in with Google
    </button>
  );
}
```

## 3. Migration Prompt Modal

```tsx
// app/components/auth/MigrationPrompt.tsx
export function MigrationPrompt({ localHabits, onMigrate, onSkip }) {
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            👋 Welcome back!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            We found {localHabits.length} habits in your browser storage.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={onMigrate} 
              className="w-full"
              variant="default"
            >
              📤 Sync to Cloud
            </Button>
            
            <Button 
              onClick={onSkip} 
              className="w-full"
              variant="outline"
            >
              🗑️ Start Fresh
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Your data will be safe and synced across devices!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 4. Authenticated App Header

```tsx
// app/components/AuthenticatedHeader.tsx
export function AuthenticatedHeader({ user }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h1 className="text-xl font-semibold">Habits</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <SyncStatusIndicator />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
```

## 5. User Dropdown Menu

```tsx
// app/components/auth/UserDropdown.tsx
export function UserDropdown({ user }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="hidden sm:block">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          ⚙️ Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          📊 Export Data
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-red-600">
          🚪 Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 6. Sync Status Indicator

```tsx
// app/components/SyncStatusIndicator.tsx
export function SyncStatusIndicator() {
  const { syncStatus } = useSyncStatus();
  
  const statusConfig = {
    synced: { icon: "✅", text: "Synced", color: "text-green-600" },
    syncing: { icon: "🔄", text: "Syncing...", color: "text-blue-600" },
    offline: { icon: "📱", text: "Offline", color: "text-gray-600" },
    error: { icon: "⚠️", text: "Sync Error", color: "text-red-600" },
  };
  
  const config = statusConfig[syncStatus];
  
  return (
    <div className={`flex items-center gap-1 text-xs ${config.color}`}>
      <span>{config.icon}</span>
      <span className="hidden sm:block">{config.text}</span>
    </div>
  );
}
```

## 7. User Profile Settings Page

```tsx
// app/routes/profile.tsx
export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            📊 Export All Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            📥 Import Data
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="destructive" className="w-full">
            🗑️ Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 8. Loading States

```tsx
// app/components/auth/AuthLoadingSpinner.tsx
export function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}
```

## 🎨 Design System Colors & Styling

```css
/* Authentication theme colors */
:root {
  --auth-primary: #2563eb;      /* Blue 600 */
  --auth-primary-hover: #1d4ed8; /* Blue 700 */
  --auth-success: #059669;      /* Emerald 600 */
  --auth-warning: #d97706;      /* Amber 600 */
  --auth-error: #dc2626;        /* Red 600 */
  --auth-bg-gradient: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
}
```

## 📱 Responsive Behavior

- **Mobile**: Stack elements vertically, hide text labels, show icons only
- **Tablet**: Show abbreviated text, maintain horizontal layout
- **Desktop**: Full text labels, expanded dropdowns, side-by-side layouts

## ♿ Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader Support**: Proper ARIA labels and descriptions  
- **High Contrast**: Support for high contrast mode
- **Focus Indicators**: Clear focus rings on all interactive elements