import { Platform } from 'expo-modules-core';
import { useCallback, useEffect, useState } from 'react';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Native session data structure (normalized)
interface NativeSessionData {
  sessionId?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    primaryEmailAddress?: string;
  };
}

// Raw result from the native module (may vary by platform)
interface NativeSessionRawResult {
  sessionId?: string;
  session?: { id: string };
  user?: NativeSessionData['user'];
}

// Get the native module (use optional require to avoid crash if not available)
let ClerkExpo: {
  getSession: () => Promise<NativeSessionRawResult | null>;
} | null = null;

if (isNativeSupported) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require('expo-modules-core');
    ClerkExpo = requireNativeModule('ClerkExpo');
  } catch {
    // Native module not available - this is expected when expo plugin is not installed
  }
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

  const refresh = useCallback(async () => {
    if (!isNativeSupported || !ClerkExpo?.getSession) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await ClerkExpo.getSession();
      // Normalize: iOS returns { sessionId }, Android returns { session: { id } }
      const id = result?.sessionId ?? result?.session?.id ?? null;
      setSessionId(id);
      setUser(result?.user ?? null);
    } catch (error) {
      console.log('[useNativeSession] Error fetching native session:', error);
      setSessionId(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check native session on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    isAvailable: isNativeSupported && !!ClerkExpo,
    isLoading,
    isSignedIn: !!sessionId,
    sessionId,
    user,
    refresh,
  };
}
