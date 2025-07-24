import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react-router';

interface OptimisticAuthState {
  isSignedIn: boolean | null; // null = unknown, true = signed in, false = signed out
  user: any;
  isLoaded: boolean;
  wasSignedInBefore: boolean; // Based on localStorage cache
}

/**
 * Hook that provides optimistic authentication state
 * Shows cached auth state immediately while Clerk loads in background
 */
export function useOptimisticAuth(): OptimisticAuthState {
  const { isSignedIn, user, isLoaded } = useUser();
  const [wasSignedInBefore, setWasSignedInBefore] = useState(false);

  // Check localStorage for previous auth state on mount
  useEffect(() => {
    const cachedAuthState = localStorage.getItem('clerk-auth-cache');
    if (cachedAuthState) {
      try {
        const parsed = JSON.parse(cachedAuthState);
        setWasSignedInBefore(parsed.wasSignedIn === true);
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  // Cache auth state when it changes
  useEffect(() => {
    if (isLoaded && isSignedIn !== undefined) {
      localStorage.setItem('clerk-auth-cache', JSON.stringify({
        wasSignedIn: isSignedIn,
        timestamp: Date.now()
      }));
    }
  }, [isLoaded, isSignedIn]);

  return {
    isSignedIn: isLoaded ? isSignedIn : (wasSignedInBefore ? true : null),
    user,
    isLoaded,
    wasSignedInBefore
  };
}