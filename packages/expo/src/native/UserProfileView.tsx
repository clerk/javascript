import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import type { NativeClerkUserProfileViewRef } from '../specs/NativeClerkUserProfileView';
import NativeClerkUserProfileView from '../specs/NativeClerkUserProfileView';
import { isNativeSupported } from '../utils/native-module';
import type { HostedNavigationProps, HostedNavigationRef, HostedNavigationState } from './HostedNavigation.types';

/**
 * Props for the UserProfileView component.
 */
export interface UserProfileViewProps extends HostedNavigationProps {
  /**
   * Whether the inline profile view shows a dismiss button.
   *
   * This controls the native view's built-in dismiss button. It does not present
   * a modal; render `UserProfileView` inside your own `Modal`, sheet, or route.
   *
   * @default true
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
 * Imperative handle exposed by {@link UserProfileView}.
 */
export type UserProfileViewRef = HostedNavigationRef;

/**
 * A pre-built native component for managing the user's profile and account settings.
 *
 * `UserProfileView` renders inline within your React Native view hierarchy, powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * To present the profile, render it inside your own `Modal`, sheet, or route.
 *
 * To push the profile onto your own navigation stack with a single header, enable
 * `hideHeader` and drive back navigation through the component ref — or, with
 * expo-router, use the prewired screen from `@clerk/expo/native/router`.
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
export const UserProfileView = forwardRef<UserProfileViewRef, UserProfileViewProps>(function UserProfileView(
  { isDismissible = true, hideHeader = false, style, onDismiss, onNavigationChange },
  ref,
) {
  const nativeRef = useRef<NativeClerkUserProfileViewRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      goBack: () => nativeRef.current?.goBack() ?? Promise.resolve(),
      popToRoot: () => nativeRef.current?.popToRoot() ?? Promise.resolve(),
    }),
    [],
  );

  const handleProfileEvent = useCallback(
    (event: { nativeEvent: { type: string } }) => {
      if (event.nativeEvent.type === 'dismissed') {
        onDismiss?.();
      }
    },
    [onDismiss],
  );

  const handleNavigationChange = useCallback(
    (event: NativeSyntheticEvent<HostedNavigationState>) => {
      const { depth, canGoBack } = event.nativeEvent;
      onNavigationChange?.({ depth, canGoBack });
    },
    [onNavigationChange],
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
      ref={nativeRef}
      style={[styles.container, style]}
      isDismissible={isDismissible}
      hideHeader={hideHeader}
      onProfileEvent={handleProfileEvent}
      onNavigationChange={hideHeader ? handleNavigationChange : undefined}
    />
  );
});

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
