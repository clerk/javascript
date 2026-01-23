import { useClerk } from '@clerk/react';
import { Platform } from 'expo-modules-core';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation (use optional require to avoid crash if not available)
let ClerkExpo: {
  presentUserProfile: (options: { dismissable: boolean }) => Promise<{ sessionId?: string } | null>;
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

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentUserProfile) {
      return;
    }

    const presentModal = async () => {
      try {
        console.log('[UserProfile] Presenting native profile modal');
        const result = await ClerkExpo.presentUserProfile({
          dismissable: isDismissable,
        });

        console.log('[UserProfile] Sign out event received, sessionId:', result?.sessionId);

        // Also sign out from JS SDK to ensure both native and JS states are cleared
        if (clerk?.signOut) {
          try {
            console.log('[UserProfile] Signing out from JS SDK...');
            await clerk.signOut();
            console.log('[UserProfile] JS SDK signed out');
          } catch (signOutErr) {
            console.warn('[UserProfile] JS SDK sign out error (may already be signed out):', signOutErr);
          }
        }

        onSignOut?.();
      } catch (err) {
        console.error('[UserProfile] Error:', err);
      }
    };

    presentModal();
  }, [isDismissable, onSignOut, clerk]);

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
