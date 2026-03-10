import { useClerk, useUser } from '@clerk/react';
import { useCallback, useRef } from 'react';

import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { tokenCache } from '../token-cache';
import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';

// Raw result from the native module (may vary by platform)
type NativeSessionResult = {
  sessionId?: string;
  session?: { id: string };
};

export interface UseUserProfileModalReturn {
  /**
   * Present the native user profile modal.
   *
   * The returned promise resolves when the modal is dismissed.
   * If the user signed out from within the profile modal,
   * the JS SDK session is automatically cleared.
   */
  presentUserProfile: () => Promise<void>;

  /**
   * Whether the native module supports presenting the profile modal.
   */
  isAvailable: boolean;
}

/**
 * Imperative hook for presenting the native user profile modal.
 *
 * Call `presentUserProfile()` from a button's `onPress` to show the native
 * profile management screen (SwiftUI on iOS, Jetpack Compose on Android).
 * The promise resolves when the modal is dismissed.
 *
 * Sign-out is detected automatically — if the user signs out from within
 * the profile modal, the JS SDK session is cleared so `useAuth()` updates
 * reactively.
 *
 * @example
 * ```tsx
 * import { useUserProfileModal } from '@clerk/expo';
 *
 * function MyScreen() {
 *   const { presentUserProfile } = useUserProfileModal();
 *
 *   return (
 *     <TouchableOpacity onPress={presentUserProfile}>
 *       <Text>Manage Profile</Text>
 *     </TouchableOpacity>
 *   );
 * }
 * ```
 */
export function useUserProfileModal(): UseUserProfileModalReturn {
  const clerk = useClerk();
  const { user } = useUser();
  const presentingRef = useRef(false);

  const presentUserProfile = useCallback(async () => {
    if (presentingRef.current) {
      return;
    }

    if (!isNativeSupported || !ClerkExpo?.presentUserProfile) {
      return;
    }

    presentingRef.current = true;
    try {
      // If native doesn't have a session but JS does (e.g. user signed in via custom form),
      // sync the JS SDK's bearer token to native and wait for it before presenting.
      if (user && ClerkExpo?.getSession && ClerkExpo?.configure) {
        const preCheck = (await ClerkExpo.getSession()) as NativeSessionResult | null;
        const hasSession = !!(preCheck?.sessionId || preCheck?.session?.id);

        if (!hasSession) {
          const bearerToken = (await tokenCache?.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
          if (bearerToken) {
            await ClerkExpo.configure(clerk.publishableKey, bearerToken);
          }
        }
      }

      await ClerkExpo.presentUserProfile({
        dismissable: true,
      });

      // Check if native session still exists after modal closes
      // If session is null, user signed out from the native UI
      const sessionCheck = (await ClerkExpo.getSession?.()) as NativeSessionResult | null;
      const hasNativeSession = !!(sessionCheck?.sessionId || sessionCheck?.session?.id);

      if (!hasNativeSession) {
        // Clear native session explicitly (may already be cleared, but ensure it)
        try {
          await ClerkExpo.signOut?.();
        } catch (e) {
          if (__DEV__) {
            console.warn('[useUserProfileModal] Native signOut error (may already be signed out):', e);
          }
        }

        // Sign out from JS SDK to update isSignedIn state
        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch (e) {
            if (__DEV__) {
              console.warn('[useUserProfileModal] Best-effort JS SDK signOut failed:', e);
            }
          }
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[useUserProfileModal] presentUserProfile failed:', error);
      }
    } finally {
      presentingRef.current = false;
    }
  }, [clerk, user]);

  return {
    presentUserProfile,
    isAvailable: isNativeSupported && !!ClerkExpo?.presentUserProfile,
  };
}
