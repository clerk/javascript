import { requireNativeModule, Platform } from 'expo-modules-core';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation
const ClerkExpo = isNativeSupported ? requireNativeModule('ClerkExpo') : null;

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
        onSignOut?.();
      } catch (err) {
        console.error('[UserProfile] Error:', err);
      }
    };

    presentModal();
  }, [isDismissable, onSignOut]);

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
