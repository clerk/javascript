import { useCallback, useEffect, useState } from 'react';

import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';
import { addNativeSessionListener, type NativeSessionSnapshot } from './nativeSessionEvents';

type NativeSessionUser = NonNullable<NativeSessionSnapshot['user']>;

// Native session data structure (normalized)
interface NativeSessionData {
  sessionId?: string;
  user?: NativeSessionUser;
}

// Raw result from the native module (may vary by platform)
interface NativeSessionRawResult {
  sessionId?: string;
  session?: { id: string };
  user?: NativeSessionData['user'];
}

export interface UseNativeSessionReturn {
  /**
   * Whether the native module is available (expo plugin installed)
   */
  isAvailable: boolean;

  /**
   * Whether the native session check is still loading
   */
  isLoading: boolean;

  /**
   * Whether there is an active native session
   */
  isSignedIn: boolean;

  /**
   * The native session ID, if available
   */
  sessionId: string | null;

  /**
   * The native user data, if available
   */
  user: NativeSessionData['user'] | null;

  /**
   * Refresh the native session state
   */
  refresh: () => Promise<void>;
}

/**
 * Hook to access native SDK session state.
 *
 * This hook is only useful when the @clerk/expo native plugin is installed.
 * Without the plugin, `isAvailable` will be false and session will always be null.
 *
 * @example
 * ```tsx
 * import { useNativeSession } from '@clerk/expo';
 *
 * function MyComponent() {
 *   const { isAvailable, isLoading, isSignedIn, user } = useNativeSession();
 *
 *   if (!isAvailable) {
 *     // Native plugin not installed, use regular useAuth() instead
 *     return <RegularAuthFlow />;
 *   }
 *
 *   if (isLoading) {
 *     return <Loading />;
 *   }
 *
 *   if (isSignedIn) {
 *     return <Text>Welcome {user?.firstName}!</Text>;
 *   }
 *
 *   return <SignInButton />;
 * }
 * ```
 */
export function useNativeSession(): UseNativeSessionReturn {
  const [isLoading, setIsLoading] = useState(isNativeSupported && !!ClerkExpo);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<NativeSessionData['user'] | null>(null);

  const applySnapshot = useCallback((snapshot: NativeSessionSnapshot | NativeSessionRawResult | null) => {
    const id = snapshot?.sessionId ?? snapshot?.session?.id ?? null;
    setSessionId(id);
    setUser(snapshot?.user ?? null);
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    if (!isNativeSupported || !ClerkExpo?.getSession) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = (await ClerkExpo.getSession()) as NativeSessionRawResult | null;
      applySnapshot(result);
    } catch (error) {
      if (__DEV__) {
        console.error('[useNativeSession] Error fetching native session:', error);
      }
      setSessionId(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [applySnapshot]);

  // Check native session on mount
  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return addNativeSessionListener(snapshot => {
      if (snapshot) {
        applySnapshot(snapshot);
        return;
      }

      void refresh();
    });
  }, [applySnapshot, refresh]);

  return {
    isAvailable: isNativeSupported && !!ClerkExpo,
    isLoading,
    isSignedIn: !!sessionId,
    sessionId,
    user,
    refresh,
  };
}
