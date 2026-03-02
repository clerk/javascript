import { useClerk } from '@clerk/react';
import { useCallback, useRef } from 'react';
import { Platform, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

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

export interface InlineUserProfileViewProps {
  /**
   * Whether the profile view can be dismissed by the user.
   * @default false
   */
  isDismissable?: boolean;

  /**
   * Style applied to the container view.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * An inline native user profile component that renders in-place.
 *
 * `InlineUserProfileView` renders directly within your React Native view hierarchy.
 *
 * Sign-out is detected automatically and synced with the JS SDK. Use `useAuth()` in a
 * `useEffect` to react to sign-out.
 *
 * @example
 * ```tsx
 * import { InlineUserProfileView } from '@clerk/expo/native';
 * import { useAuth } from '@clerk/expo';
 *
 * export default function ProfileScreen() {
 *   const { isSignedIn } = useAuth();
 *
 *   useEffect(() => {
 *     if (!isSignedIn) router.replace('/sign-in');
 *   }, [isSignedIn]);
 *
 *   return <InlineUserProfileView style={{ flex: 1 }} />;
 * }
 * ```
 */
export function InlineUserProfileView({ isDismissable = false, style }: InlineUserProfileViewProps) {
  const clerk = useClerk();
  const signOutTriggered = useRef(false);

  const handleProfileEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: string } }) => {
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
      }
    },
    [clerk],
  );

  if (!isNativeSupported || !NativeClerkUserProfileView) {
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
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
