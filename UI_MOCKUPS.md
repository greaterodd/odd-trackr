# 🎨 Authentication UI Mockups & Components

## Migration Prompt Modal

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

## Sync Status Indicator

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