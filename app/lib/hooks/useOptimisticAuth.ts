import { useUser } from "@clerk/react-router";

/**
 * A simple wrapper around Clerk's useUser hook.
 *
 * This hook provides the user's authentication status (`isSignedIn`),
 * the user object itself, and a boolean (`isLoaded`) to indicate
 * when the authentication state has been determined.
 *
 * By using this hook, we can ensure that our components have a
 * consistent way to access authentication state throughout the app.
 */
export function useOptimisticAuth() {
  const { isSignedIn, user, isLoaded } = useUser();

  return {
    isSignedIn,
    user,
    isLoaded,
  };
}
