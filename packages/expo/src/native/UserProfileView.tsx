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
    console.log('[UserProfileView] ClerkExpo native module not available on this platform');
  }
}

/**
 * Props for the UserProfileView component.
 */
export interface UserProfileViewProps extends ViewProps {
  /**
   * Whether the profile view can be dismissed by the user.
   *
   * When `true`, a dismiss button appears in the navigation bar and the modal
   * can be dismissed by swiping down or tapping outside (on iOS).
   *
   * When `false`, the user must use the sign-out action to close the view.
   *
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Callback fired when the user signs out from the profile view.
   *
   * This is called after:
   * 1. The native session is cleared
   * 2. The JS SDK session is cleared
   *
   * After this callback, `useAuth()` will return `isSignedIn: false`.
   */
  onSignOut?: () => void;
}

/**
 * A pre-built native component for managing the user's profile and account settings.
 *
 * `UserProfileView` presents a comprehensive, native UI for account management powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * ## Profile Sections
 *
 * The profile view includes all user management features enabled in your
 * [Clerk Dashboard](https://dashboard.clerk.com):
 *
 * ### Profile Information
 * - View and edit profile photo
 * - Update first name, last name, username
 * - View account creation date
 *
 * ### Email Addresses
 * - View all email addresses
 * - Add new email addresses
 * - Verify email addresses
 * - Remove email addresses
 * - Set primary email address
 *
 * ### Phone Numbers
 * - View all phone numbers
 * - Add new phone numbers
 * - Verify phone numbers via SMS
 * - Remove phone numbers
 * - Set primary phone number
 *
 * ### Password & Security
 * - Change password
 * - Set password (if using passwordless auth)
 *
 * ### Multi-Factor Authentication
 * - Enable/disable SMS verification
 * - Enable/disable TOTP (authenticator apps)
 * - View and regenerate backup codes
 *
 * ### Passkeys
 * - View registered passkeys
 * - Add new passkeys
 * - Remove passkeys
 *
 * ### Connected Accounts
 * - View connected OAuth providers (Google, Apple, GitHub, etc.)
 * - Connect new OAuth accounts
 * - Disconnect OAuth accounts
 *
 * ### Active Sessions
 * - View all active sessions/devices
 * - Sign out from other devices
 * - See session details (IP, location, browser)
 *
 * ### Account Actions
 * - Sign out
 * - Delete account (if enabled)
 *
 * ## Usage with JS SDK APIs
 *
 * While `UserProfileView` provides a native UI for common operations, you can
 * also use JS SDK APIs directly for custom implementations:
 *
 * ```tsx
 * import { useUser } from '@clerk/expo';
 *
 * function CustomProfile() {
 *   const { user } = useUser();
 *
 *   // Profile updates
 *   await user.update({ firstName: 'New Name' });
 *
 *   // Email management
 *   await user.createEmailAddress({ email: 'new@example.com' });
 *   await emailAddress.prepareVerification({ strategy: 'email_code' });
 *   await emailAddress.attemptVerification({ code: '123456' });
 *
 *   // MFA setup
 *   const totp = await user.createTOTP();
 *   await totp.attemptVerification({ code: '123456' });
 *
 *   // Passkey management
 *   await user.createPasskey();
 * }
 * ```
 *
 * @example Basic usage
 * ```tsx
 * import { UserProfileView } from '@clerk/expo/native';
 *
 * export default function ProfileScreen() {
 *   return (
 *     <UserProfileView
 *       onSignOut={() => router.replace('/sign-in')}
 *     />
 *   );
 * }
 * ```
 *
 * @example Non-dismissable profile
 * ```tsx
 * <UserProfileView
 *   isDismissable={false}
 *   onSignOut={() => router.replace('/sign-in')}
 *   style={{ flex: 1 }}
 * />
 * ```
 *
 * @see {@link https://clerk.com/docs/components/user/user-profile} Clerk UserProfile Documentation
 * @see {@link https://clerk.com/docs/users/overview} User Management Documentation
 */
export function UserProfileView({ isDismissable = true, onSignOut, style, ...props }: UserProfileViewProps) {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  // Track if we've already triggered sign-out to prevent double-calls
  const signOutTriggered = useRef(false);

  // Stable refs for callbacks/values to avoid re-triggering the effect
  const onSignOutRef = useRef(onSignOut);
  onSignOutRef.current = onSignOut;
  const clerkRef = useRef(clerk);
  clerkRef.current = clerk;
  const isSignedInRef = useRef(isSignedIn);
  isSignedInRef.current = isSignedIn;

  // Reset sign-out flag on mount only
  useEffect(() => {
    signOutTriggered.current = false;
  }, []);

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentUserProfile) {
      return;
    }

    const presentModal = async () => {
      try {
        await ClerkExpo.presentUserProfile({
          dismissable: isDismissable,
        });

        // Check if native session still exists after modal closes
        // If session is null, user signed out from the native UI
        const sessionCheck = await ClerkExpo.getSession?.();
        const hasNativeSession = !!sessionCheck?.session;

        if (!hasNativeSession && !signOutTriggered.current) {
          signOutTriggered.current = true;

          // Clear native session explicitly (may already be cleared, but ensure it)
          try {
            await ClerkExpo.signOut?.();
          } catch {
            // May already be signed out
          }

          // Sign out from JS SDK - this is critical to update isSignedIn state
          const currentClerk = clerkRef.current;
          if (currentClerk?.signOut) {
            try {
              await currentClerk.signOut();
            } catch (signOutErr) {
              console.warn('[UserProfileView] JS SDK sign out error:', signOutErr);
              // TODO: Consider a public API for force-refreshing SDK state
            }
          }

          // Call onSignOut callback AFTER JS SDK sign-out completes
          onSignOutRef.current?.();
        }
      } catch (err) {
        console.error('[UserProfileView] Error:', err);
      }
    };

    void presentModal();
  }, [isDismissable]);

  // Show a placeholder when native modules aren't available
  if (!isNativeSupported || !ClerkExpo) {
    return (
      <View
        style={[styles.container, style]}
        {...props}
      >
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native UserProfileView is only available on iOS and Android'
            : 'Native UserProfileView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
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
