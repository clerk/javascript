import type { ComponentProps, ComponentType, JSX, Ref } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import NativeClerkUserProfileView from '../specs/NativeClerkUserProfileView';
import { isNativeSupported } from '../utils/native-module';
import type { EmbeddedNavigationProps } from './EmbeddedNavigation.types';
import type {
  NativeUserProfileNavigationHandle,
  UserProfileCustomDestination,
  UserProfileCustomPage,
  UserProfileCustomPageEvent,
} from './UserProfileCustomPages';
import {
  serializeUserProfileCustomPages,
  UserProfileCustomPageHosts,
  useUserProfileCustomPages,
} from './UserProfileCustomPages';

type CustomizableNativeUserProfileProps = ComponentProps<NonNullable<typeof NativeClerkUserProfileView>> & {
  customPages?: string;
  onCustomPageEvent?: (event: NativeSyntheticEvent<UserProfileCustomPageEvent>) => void;
  ref?: Ref<NativeUserProfileNavigationHandle>;
};

const CustomizableNativeClerkUserProfileView =
  NativeClerkUserProfileView as ComponentType<CustomizableNativeUserProfileProps> | null;

/**
 * Props for the UserProfileView component.
 */
export interface UserProfileViewProps extends EmbeddedNavigationProps {
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

  /** Custom pages displayed as rows in the root profile screen. */
  customPages?: UserProfileCustomPage[];

  /** Custom destinations that can be pushed from a custom page without creating a root profile row. */
  customDestinations?: UserProfileCustomDestination[];
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
 * To push the profile onto your own navigation stack, hide the route's header and
 * pass `onHostBack` so Clerk's own chrome takes over.
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
 *   return (
 *     <UserProfileView
 *       style={{ flex: 1 }}
 *       customPages={[
 *         { path: 'billing', label: 'Billing', icon: 'billing', content: <BillingView /> },
 *         { path: 'docs', label: 'Docs', icon: 'book', href: 'https://clerk.com/docs' },
 *       ]}
 *       customDestinations={[
 *         { path: 'invoice-details', label: 'Invoice details', content: <InvoiceDetailsView /> },
 *       ]}
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link https://clerk.com/docs/components/user/user-profile} Clerk UserProfile Documentation
 */
export function UserProfileView({
  isDismissible = true,
  style,
  onDismiss,
  onHostBack,
  customPages = [],
  customDestinations = [],
}: UserProfileViewProps): JSX.Element {
  const nativeViewRef = useRef<NativeUserProfileNavigationHandle>(null);
  const customRoutes = useMemo(() => [...customPages, ...customDestinations], [customDestinations, customPages]);
  const { navigation, presentedPaths, onCustomPageEvent } = useUserProfileCustomPages(customRoutes, nativeViewRef);
  const handleProfileEvent = useCallback(
    (event: { nativeEvent: { type: string } }) => {
      if (event.nativeEvent.type === 'dismissed') {
        onDismiss?.();
      }
    },
    [onDismiss],
  );

  if (!isNativeSupported || !CustomizableNativeClerkUserProfileView) {
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
    <CustomizableNativeClerkUserProfileView
      ref={nativeViewRef}
      style={[styles.container, style]}
      isDismissible={isDismissible}
      hostBackButton={!!onHostBack}
      customPages={serializeUserProfileCustomPages(customPages, customDestinations)}
      onProfileEvent={handleProfileEvent}
      onCustomPageEvent={onCustomPageEvent}
      onHostBack={onHostBack ? () => onHostBack() : undefined}
    >
      <UserProfileCustomPageHosts
        customRoutes={customRoutes}
        presentedPaths={presentedPaths}
        navigation={navigation}
      />
    </CustomizableNativeClerkUserProfileView>
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
