import { SignIn } from "@clerk/react-router";
import type { Route } from "./+types/sign-in";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trackr | Sign In"},
    { name: "description", content: "Welcome to your next project!" },
  ]
}

export default function LoginPage() {
  return (
    <div className="max-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-fit w-2xl space-y-6 sm:px-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 pt-4">Habit Tracker</h1>
          <p className="mt-2 text-gray-600">Track your daily habits</p>
          <p className="text-xs md:text-sm text-gray-500">Build better routines</p>
        </div>
        
        <div className="space-y-4">
          <SignIn />
          
          <div className="text-center text-xs text-gray-500 pb-4">
            <p>🔒 Secure • 🔐 Private • ☁️ Synced</p>
          </div>
        </div>
      </div>
    </div>
  );
}