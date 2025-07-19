import { SignIn } from "@clerk/react-router";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-fit w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="mt-2 text-gray-600">Track your daily habits</p>
          <p className="text-sm text-gray-500">Build better routines</p>
        </div>
        
        <div className="space-y-4">
          <SignIn />
          
          <div className="text-center text-xs text-gray-500">
            <p>🔒 Secure • 🔐 Private • ☁️ Synced</p>
          </div>
        </div>
      </div>
    </div>
  );
}