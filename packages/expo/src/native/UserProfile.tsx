import { useClerk, useAuth } from '@clerk/react';
import { Platform } from 'expo-modules-core';
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation (use optional require to avoid crash if not available)
let ClerkExpo: {
  presentUserProfile: (options: { dismissable: boolean }) => Promise<{ session?: { id: string } } | null>;
  signOut: () => Promise<void>;
  getSession: () => Promise<{ session?: { id: string } } | null>;
} | null = null;
if (isNativeSupported) {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    ClerkExpo = requireNativeModule('ClerkExpo');
  } catch {
    console.log('[UserProfile] ClerkExpo native module not available on this platform');
  }
}

export interface UserProfileProps extends ViewProps {
  /**
   * Whether the view can be dismissed by the user.
   * When true, a dismiss button appears in the navigation bar.
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Callback fired when the user signs out
   */
  onSignOut?: () => void;
}

/**
 * Native UserProfile component powered by clerk-ios (SwiftUI) and clerk-android (Jetpack Compose)
 *
 * Provides a comprehensive profile management interface including:
 * - Profile information display and editing
 * - Security settings
 * - Email/phone management
 * - Password management
 * - MFA settings (SMS, TOTP, backup codes)
 * - Passkey management
 * - Connected OAuth accounts
 * - Device sessions
 * - Account switching (multi-session mode)
 * - Sign out
 *
 * This component presents the native profile UI modally when mounted.
 *
 * Uses the official Clerk native packages:
 * - iOS: https://github.com/clerk/clerk-ios
 * - Android: https://github.com/clerk/clerk-android
 *
 * @example
 * ```tsx
 * import { UserProfile } from '@clerk/clerk-expo/native';
 *
 * export default function ProfileScreen() {
 *   return (
 *     <UserProfile
 *       isDismissable={false}
 *       onSignOut={() => router.replace('/sign-in')}
 *       style={{ flex: 1 }}
 *     />
 *   );
 * }
 * ```
 */
export function UserProfile({ isDismissable = true, onSignOut, style, ...props }: UserProfileProps) {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  // Track if we've already triggered sign-out to prevent double-calls
  const signOutTriggered = useRef(false);

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentUserProfile) {
      return;
    }

    // Reset sign-out flag when component mounts
    signOutTriggered.current = false;

    const presentModal = async () => {
      try {
        console.log('[UserProfile] Presenting native profile modal');
        const result = await ClerkExpo.presentUserProfile({
          dismissable: isDismissable,
        });

        console.log('[UserProfile] Profile modal closed, result:', result);

        // Check if native session still exists after modal closes
        // If session is null, user signed out from the native UI
        const sessionCheck = await ClerkExpo.getSession?.();
        const hasNativeSession = !!sessionCheck?.session;

        console.log('[UserProfile] Native session after close:', hasNativeSession);
        console.log('[UserProfile] JS SDK isSignedIn:', isSignedIn);

        if (!hasNativeSession && !signOutTriggered.current) {
          signOutTriggered.current = true;
          console.log('[UserProfile] User signed out from native profile');

          // Clear native session explicitly (may already be cleared, but ensure it)
          try {
            console.log('[UserProfile] Clearing native session...');
            await ClerkExpo.signOut?.();
            console.log('[UserProfile] Native session cleared');
          } catch (nativeSignOutErr) {
            console.warn('[UserProfile] Native sign out error (may already be signed out):', nativeSignOutErr);
          }

          // Sign out from JS SDK - this is critical to update isSignedIn state
          // Use the clerk instance directly and wait for completion
          if (clerk?.signOut) {
            try {
              console.log('[UserProfile] Signing out from JS SDK...');
              await clerk.signOut();
              console.log('[UserProfile] JS SDK signed out successfully');
            } catch (signOutErr) {
              console.warn('[UserProfile] JS SDK sign out error:', signOutErr);
              // Even if signOut throws, try to force reload to clear stale state
              const clerkAny = clerk as { __internal_reloadInitialResources?: () => Promise<void> };
              if (clerkAny?.__internal_reloadInitialResources) {
                try {
                  console.log('[UserProfile] Force reloading JS SDK state...');
                  await clerkAny.__internal_reloadInitialResources();
                  console.log('[UserProfile] JS SDK state reloaded');
                } catch (reloadErr) {
                  console.warn('[UserProfile] Failed to reload JS SDK state:', reloadErr);
                }
              }
            }
          }

          // Call onSignOut callback AFTER JS SDK sign-out completes
          console.log('[UserProfile] Calling onSignOut callback');
          onSignOut?.();
        } else if (hasNativeSession) {
          console.log('[UserProfile] User dismissed profile without signing out');
          // User just closed the profile, don't trigger sign-out
        }
      } catch (err) {
        console.error('[UserProfile] Error:', err);
      }
    };

    void presentModal();
  }, [isDismissable, onSignOut, clerk, isSignedIn]);

  // Show a placeholder while modal is presented
  if (!isNativeSupported) {
    return (
      <View
        style={[styles.container, style]}
        {...props}
      >
        <Text style={styles.text}>Native UserProfile is only available on iOS and Android</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
