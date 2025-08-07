import { useEffect, useState } from "react";
import { useUser } from "@clerk/react-router";
import { useAuthState, useAuthStore } from "../stores/authStore";

interface OptimisticAuthState {
  isSignedIn: boolean | null; // null = unknown, true = signed in, false = signed out
  user: any;
  isLoaded: boolean;
}

/**
 * Hook that provides optimistic authentication state
 * Shows cached auth state immediately while Clerk loads in background
 */

export function useOptimisticAuth(): OptimisticAuthState {
  const { isSignedIn, user, isLoaded } = useUser();
  const wasPreviouslyLogged = useAuthState();
  const setWasPreviouslyLogged = useAuthStore(
    (state) => state.setWasPreviouslyLogged,
  );

  // Check localStorage for previous auth state on mount
  useEffect(() => {
    const cachedAuthState = localStorage.getItem("clerk-auth-cache");
    if (cachedAuthState) {
      try {
        const parsed = JSON.parse(cachedAuthState);
        setWasPreviouslyLogged(parsed.wasSignedIn === true);
      } catch {
        // Ignore parsing errors
        setWasPreviouslyLogged(false);
      }
    } else {
      setWasPreviouslyLogged(false);
    }
  }, [setWasPreviouslyLogged]);

  // Cache auth state when it changes
  useEffect(() => {
    if (isLoaded && isSignedIn !== undefined && isSignedIn) {
      localStorage.setItem(
        "clerk-auth-cache",
        JSON.stringify({
          wasSignedIn: true,
          timestamp: Date.now(),
        }),
      );
      setWasPreviouslyLogged(true);
    }
  }, [isLoaded, isSignedIn, setWasPreviouslyLogged]);

  return {
    isSignedIn: isLoaded ? isSignedIn : wasPreviouslyLogged,
    user,
    isLoaded,
  };
}
