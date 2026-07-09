import { StyleSheet } from 'react-native';

import NativeClerkUserButtonView from '../specs/NativeClerkUserButtonView';
import { isNativeSupported } from '../utils/native-module';

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
 *   return <UserButton />;
 * }
 * ```
 *
 * @see {@link UserProfileView} The profile view to render in your own presentation surface
 * @see {@link https://clerk.com/docs/components/user/user-button} Clerk UserButton Documentation
 */
export function UserButton() {
  if (!isNativeSupported || !NativeClerkUserButtonView) {
    return null;
  }

  return <NativeClerkUserButtonView style={styles.host} />;
}

const styles = StyleSheet.create({
  // React Native/Yoga does not infer the intrinsic size of this native host view.
  host: {
    width: 36,
    height: 36,
  },
});
