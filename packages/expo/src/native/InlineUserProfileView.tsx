import { useClerk } from '@clerk/react';
import { requireNativeViewManager, Platform } from 'expo-modules-core';
import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native view component for inline rendering
let NativeUserProfileView: any = null;
if (isNativeSupported) {
  try {
    NativeUserProfileView = requireNativeViewManager('ClerkExpo', 'ClerkUserProfileExpoView');
  } catch {
    NativeUserProfileView = null;
  }
}

// Get the native module for session operations
let ClerkExpo: { signOut(): Promise<void>; getSession(): Promise<any> } | null = null;
if (isNativeSupported) {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    ClerkExpo = requireNativeModule('ClerkExpo');
  } catch {
    ClerkExpo = null;
  }
}

export interface InlineUserProfileViewProps {
  /**
   * Whether the profile view can be dismissed by the user.
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Callback fired when the user signs out from the profile view.
   * After this callback, `useAuth()` will return `isSignedIn: false`.
   */
  onSignOut?: () => void;

  /**
   * Callback fired when the user dismisses the profile view.
   */
  onDismiss?: () => void;

  /**
   * Style applied to the container view.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * An inline native user profile component that renders in-place (not as a modal).
 *
 * Unlike `UserProfileView` which presents a full-screen modal, `InlineUserProfileView`
 * renders directly within your React Native view hierarchy.
 *
 * @example
 * ```tsx
 * import { InlineUserProfileView } from '@clerk/expo/native';
 *
 * export default function ProfileScreen() {
 *   return (
 *     <InlineUserProfileView
 *       style={{ flex: 1 }}
 *       onSignOut={() => router.replace('/sign-in')}
 *     />
 *   );
 * }
 * ```
 */
export function InlineUserProfileView({
  isDismissable = true,
  onSignOut,
  onDismiss,
  style,
}: InlineUserProfileViewProps) {
  const clerk = useClerk();
  const signOutTriggered = useRef(false);

  const handleProfileEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: Record<string, any> } }) => {
      const { type } = event.nativeEvent;

      if (type === 'signedOut' && !signOutTriggered.current) {
        signOutTriggered.current = true;

        // Clear native session
        try {
          await ClerkExpo?.signOut();
        } catch {
          // May already be signed out
        }

        // Sign out from JS SDK
        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch (err) {
            console.warn('[InlineUserProfileView] JS SDK sign out error:', err);
          }
        }

        onSignOut?.();
      } else if (type === 'dismissed') {
        onDismiss?.();
      }
    },
    [clerk, onSignOut, onDismiss],
  );

  if (!isNativeSupported || !NativeUserProfileView) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native InlineUserProfileView is only available on iOS and Android'
            : 'Native InlineUserProfileView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeUserProfileView
      style={[styles.container, style]}
      isDismissable={isDismissable}
      onProfileEvent={handleProfileEvent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
