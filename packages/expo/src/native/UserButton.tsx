import type { ComponentProps, ComponentType, JSX, Ref } from 'react';
import { useMemo, useRef } from 'react';
import type { NativeSyntheticEvent } from 'react-native';
import { StyleSheet, useWindowDimensions } from 'react-native';

import NativeClerkUserButtonView from '../specs/NativeClerkUserButtonView';
import { isNativeSupported } from '../utils/native-module';
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

type CustomizableNativeUserButtonProps = ComponentProps<NonNullable<typeof NativeClerkUserButtonView>> & {
  customPages?: string;
  onCustomPageEvent?: (event: NativeSyntheticEvent<UserProfileCustomPageEvent>) => void;
  ref?: Ref<NativeUserProfileNavigationHandle>;
};

const CustomizableNativeClerkUserButtonView =
  NativeClerkUserButtonView as ComponentType<CustomizableNativeUserButtonProps> | null;

export interface UserButtonUserProfileProps {
  /** Custom pages displayed as rows in the user profile. */
  customPages?: UserProfileCustomPage[];

  /** Custom destinations that can be pushed from a custom page without creating a profile row. */
  customDestinations?: UserProfileCustomDestination[];
}

export interface UserButtonProps {
  /** Configuration passed to the user profile opened by the button. */
  userProfileProps?: UserButtonUserProfileProps;
}

/**
 * A pre-built button component that displays the user's avatar.
 *
 * `UserButton` renders the platform-native Clerk user button. Tapping it opens
 * the native user profile surface, matching Clerk's iOS and Android SDKs.
 *
 * @example
 * ```tsx
 * import { UserButton } from '@clerk/expo/native';
 *
 * export default function Home() {
 *   return (
 *     <UserButton
 *       userProfileProps={{
 *         customPages: [{ path: 'api-keys', label: 'API keys', icon: 'key', content: <APIKeysView /> }],
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link UserProfileView} The profile view to render in your own presentation surface
 * @see {@link https://clerk.com/docs/components/user/user-button} Clerk UserButton Documentation
 */
export function UserButton({ userProfileProps }: UserButtonProps): JSX.Element | null {
  const nativeViewRef = useRef<NativeUserProfileNavigationHandle>(null);
  const customPages = userProfileProps?.customPages;
  const customDestinations = userProfileProps?.customDestinations;
  const customRoutes = useMemo(
    () => [...(customPages ?? []), ...(customDestinations ?? [])],
    [customDestinations, customPages],
  );
  const { navigation, presentedPaths, onCustomPageEvent } = useUserProfileCustomPages(customRoutes, nativeViewRef);
  const { width, height } = useWindowDimensions();

  if (!isNativeSupported || !CustomizableNativeClerkUserButtonView) {
    return null;
  }

  return (
    <CustomizableNativeClerkUserButtonView
      ref={nativeViewRef}
      style={styles.host}
      customPages={serializeUserProfileCustomPages(customPages ?? [], customDestinations ?? [])}
      onCustomPageEvent={onCustomPageEvent}
    >
      <UserProfileCustomPageHosts
        customRoutes={customRoutes}
        presentedPaths={presentedPaths}
        navigation={navigation}
        style={{ width, height }}
      />
    </CustomizableNativeClerkUserButtonView>
  );
}

const styles = StyleSheet.create({
  // React Native/Yoga does not infer the intrinsic size of this native host view.
  host: {
    width: 36,
    height: 36,
  },
});
