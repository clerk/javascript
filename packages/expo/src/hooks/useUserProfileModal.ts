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
      let hadNativeSessionBefore = false;

      // If native doesn't have a session but JS does (e.g. user signed in via custom form),
      // sync the JS SDK's bearer token to native and wait for it before presenting.
      if (user && ClerkExpo?.getSession && ClerkExpo?.configure) {
        const preCheck = (await ClerkExpo.getSession()) as NativeSessionResult | null;
        hadNativeSessionBefore = !!(preCheck?.sessionId || preCheck?.session?.id);

        if (__DEV__) {
          console.log('[useUserProfileModal] preCheck:', JSON.stringify(preCheck));
          console.log('[useUserProfileModal] hadNativeSessionBefore:', hadNativeSessionBefore);
        }

        if (!hadNativeSessionBefore) {
          const bearerToken = (await tokenCache?.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
          if (__DEV__) {
            console.log(
              '[useUserProfileModal] bearerToken:',
              bearerToken ? `present(${bearerToken.length} chars)` : 'null',
            );
          }
          if (bearerToken) {
            if (__DEV__) {
              console.log('[useUserProfileModal] calling configure()...');
            }
            await ClerkExpo.configure(clerk.publishableKey, bearerToken);
            if (__DEV__) {
              console.log('[useUserProfileModal] configure() done');
            }

            // Re-check if configure produced a session
            const postConfigure = (await ClerkExpo.getSession()) as NativeSessionResult | null;
            hadNativeSessionBefore = !!(postConfigure?.sessionId || postConfigure?.session?.id);
            if (__DEV__) {
              console.log('[useUserProfileModal] post-configure session:', JSON.stringify(postConfigure));
            }
          }
        }
      }

      if (__DEV__) {
        console.log('[useUserProfileModal] calling presentUserProfile()...');
      }
      await ClerkExpo.presentUserProfile({
        dismissable: true,
      });
      if (__DEV__) {
        console.log('[useUserProfileModal] presentUserProfile() returned');
      }

      // Only sign out the JS SDK if native HAD a session before the modal
      // and now it's gone (user signed out from within native UI).
      const sessionCheck = (await ClerkExpo.getSession?.()) as NativeSessionResult | null;
      const hasNativeSession = !!(sessionCheck?.sessionId || sessionCheck?.session?.id);
      if (__DEV__) {
        console.log(
          '[useUserProfileModal] post-modal:',
          JSON.stringify(sessionCheck),
          'hadBefore:',
          hadNativeSessionBefore,
        );
      }

      if (!hasNativeSession && hadNativeSessionBefore) {
        if (__DEV__) {
          console.log('[useUserProfileModal] native session LOST during modal, signing out');
        }
        try {
          await ClerkExpo.signOut?.();
        } catch (e) {
          if (__DEV__) {
            console.warn('[useUserProfileModal] Native signOut error (may already be signed out):', e);
          }
        }

        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch (e) {
            if (__DEV__) {
              console.warn('[useUserProfileModal] Best-effort JS SDK signOut failed:', e);
            }
          }
        }
      } else if (__DEV__ && !hasNativeSession) {
        console.log('[useUserProfileModal] native never had session, NOT signing out JS SDK');
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
