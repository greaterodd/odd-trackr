import { SignIn } from "@clerk/react-router";
import type { Route } from "./+types/sign-in";
import { Sparkles, Shield, Cloud, Lock } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trackr | Sign In"},
    { name: "description", content: "Welcome to your next project!" },
  ]
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 animate-pulse">
              <Sparkles className="w-20 h-20 text-primary/30" />
            </div>
            <Sparkles className="w-20 h-20 text-primary animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome to Trackr
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your daily habits
            </p>
            <p className="text-sm text-muted-foreground/80">
              Build better routines, one day at a time
            </p>
          </div>
        </div>


        <div className="flex justify-center"><SignIn /></div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-muted-foreground">Secure</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-muted-foreground">Private</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Cloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs text-muted-foreground">Synced</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground/60">
              Your data is encrypted and securely stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
