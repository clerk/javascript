import { useClerk } from '@clerk/react';
import { useCallback, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';
import NativeClerkUserProfileView from '../specs/NativeClerkUserProfileView';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Safely get the native module
let ClerkExpo: typeof NativeClerkModule | null = null;
if (isNativeSupported) {
  try {
    ClerkExpo = NativeClerkModule;
  } catch {
    ClerkExpo = null;
  }
}

/**
 * Props for the UserProfileView component.
 */
export interface UserProfileViewProps {
  /**
   * Whether the inline profile view shows a dismiss button.
   *
   * This controls the native view's built-in dismiss button — it does not
   * present a modal. To present a native modal, use the `useUserProfileModal()` hook.
   *
   * @default false
   */
  isDismissable?: boolean;

  /**
   * Style applied to the container view.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A pre-built native component for managing the user's profile and account settings.
 *
 * `UserProfileView` renders inline within your React Native view hierarchy, powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * To present the profile as a native modal, use the `useUserProfileModal()` hook instead.
 *
 * Sign-out is detected automatically and synced with the JS SDK. Use `useAuth()` in a
 * `useEffect` to react to sign-out.
 *
 * @example
 * ```tsx
 * import { UserProfileView } from '@clerk/expo/native';
 * import { useAuth } from '@clerk/expo';
 *
 * export default function ProfileScreen() {
 *   const { isSignedIn } = useAuth();
 *
 *   useEffect(() => {
 *     if (!isSignedIn) router.replace('/sign-in');
 *   }, [isSignedIn]);
 *
 *   return <UserProfileView style={{ flex: 1 }} />;
 * }
 * ```
 *
 * @see {@link https://clerk.com/docs/components/user/user-profile} Clerk UserProfile Documentation
 */
export function UserProfileView({ isDismissable = false, style }: UserProfileViewProps) {
  const clerk = useClerk();
  const signOutTriggered = useRef(false);

  const handleProfileEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: string } }) => {
      const { type } = event.nativeEvent;

      if (type === 'signedOut' && !signOutTriggered.current) {
        signOutTriggered.current = true;

        try {
          await ClerkExpo?.signOut();
        } catch {
          // May already be signed out
        }

        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch (err) {
            if (__DEV__) {
              console.warn('[UserProfileView] JS SDK sign out error:', err);
            }
          }
        }
      }
    },
    [clerk],
  );

  if (!isNativeSupported || !NativeClerkUserProfileView) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native UserProfileView is only available on iOS and Android'
            : 'Native UserProfileView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkUserProfileView
      style={[styles.container, style]}
      isDismissable={isDismissable}
      onProfileEvent={handleProfileEvent}
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
