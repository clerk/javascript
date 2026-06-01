import { useCallback } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import NativeClerkUserProfileView from '../specs/NativeClerkUserProfileView';
import { isNativeSupported } from '../utils/native-module';

/**
 * Props for the UserProfileView component.
 */
export interface UserProfileViewProps {
  /**
   * Whether the inline profile view shows a dismiss button.
   *
   * This controls the native view's built-in dismiss button. It does not present
   * a modal; render `UserProfileView` inside your own `Modal`, sheet, or route.
   *
   * @default false
   */
  isDismissible?: boolean;

  /**
   * Style applied to the container view.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Called when the user dismisses the native profile view.
   */
  onDismiss?: () => void;
}

/**
 * A pre-built native component for managing the user's profile and account settings.
 *
 * `UserProfileView` renders inline within your React Native view hierarchy, powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * To present the profile, render it inside your own `Modal`, sheet, or route.
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
export function UserProfileView({ isDismissible = false, style, onDismiss }: UserProfileViewProps) {
  const handleProfileEvent = useCallback(
    (event: { nativeEvent: { type: string } }) => {
      if (event.nativeEvent.type === 'dismissed') {
        onDismiss?.();
      }
    },
    [onDismiss],
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
      isDismissible={isDismissible}
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
