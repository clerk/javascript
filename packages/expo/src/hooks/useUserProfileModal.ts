import { useClerk } from '@clerk/react';
import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Raw result from the native module (may vary by platform)
type NativeSessionResult = {
  sessionId?: string;
  session?: { id: string };
};

// Safely get the native module
let ClerkExpo: typeof NativeClerkModule | null = null;
if (isNativeSupported) {
  try {
    ClerkExpo = NativeClerkModule;
  } catch {
    ClerkExpo = null;
  }
}

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
        } catch {
          // May already be signed out
        }

        // Sign out from JS SDK to update isSignedIn state
        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch {
            // Best effort
          }
        }
      }
    } catch (error) {
      // iOS native module rejects when modal is dismissed — this is expected.
      // Log unexpected errors for debugging.
      const isDismissal =
        error instanceof Error && (error.message.includes('dismissed') || error.message.includes('cancelled'));
      if (!isDismissal) {
        console.error('[useUserProfileModal] Unexpected error from presentUserProfile:', error);
      }
    } finally {
      presentingRef.current = false;
    }
  }, [clerk]);

  return {
    presentUserProfile,
    isAvailable: isNativeSupported && !!ClerkExpo?.presentUserProfile,
  };
}
