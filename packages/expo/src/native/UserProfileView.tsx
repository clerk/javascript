import { useAuth, useClerk } from '@clerk/react';
import { Platform, requireNativeViewManager } from 'expo-modules-core';
import { useCallback, useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation and session operations
let ClerkExpo: {
  presentUserProfile: (options: { dismissable: boolean }) => Promise<{ session?: { id: string } } | null>;
  signOut: () => Promise<void>;
  getSession: () => Promise<{ session?: { id: string } } | null>;
} | null = null;
if (isNativeSupported) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require('expo-modules-core');
    ClerkExpo = requireNativeModule('ClerkExpo');
  } catch {
    // Native module not available
  }
}

// Get the native view component for inline rendering
let NativeUserProfileView: any = null;
if (isNativeSupported) {
  try {
    NativeUserProfileView = requireNativeViewManager('ClerkExpo', 'ClerkUserProfileExpoView');
  } catch {
    NativeUserProfileView = null;
  }
}

/**
 * Props for the UserProfileView component.
 */
export interface UserProfileViewProps {
  /**
   * How the profile view is presented.
   *
   * - `'modal'` - Presents a full-screen native modal (default)
   * - `'inline'` - Renders directly within the React Native view hierarchy
   *
   * @default 'modal'
   */
  presentation?: 'modal' | 'inline';

  /**
   * Whether the profile view can be dismissed by the user.
   *
   * When `true`, a dismiss button appears in the navigation bar and the modal
   * can be dismissed by swiping down or tapping outside (on iOS).
   *
   * When `false`, the user must use the sign-out action to close the view.
   *
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Callback fired when the user signs out from the profile view.
   *
   * This is called after:
   * 1. The native session is cleared
   * 2. The JS SDK session is cleared
   *
   * After this callback, `useAuth()` will return `isSignedIn: false`.
   */
  onSignOut?: () => void;

  /**
   * Callback fired when the user dismisses the profile view (inline mode only).
   */
  onDismiss?: () => void;

  /**
   * Style applied to the container view.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A pre-built native component for managing the user's profile and account settings.
 *
 * `UserProfileView` presents a comprehensive, native UI for account management powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * @example Modal presentation (default)
 * ```tsx
 * import { UserProfileView } from '@clerk/expo/native';
 *
 * export default function ProfileScreen() {
 *   return (
 *     <UserProfileView
 *       onSignOut={() => router.replace('/sign-in')}
 *     />
 *   );
 * }
 * ```
 *
 * @example Inline presentation
 * ```tsx
 * <UserProfileView
 *   presentation="inline"
 *   style={{ flex: 1 }}
 *   onSignOut={() => router.replace('/sign-in')}
 * />
 * ```
 *
 * @see {@link https://clerk.com/docs/components/user/user-profile} Clerk UserProfile Documentation
 */
export function UserProfileView({
  presentation = 'modal',
  isDismissable = true,
  onSignOut,
  onDismiss,
  style,
  ...props
}: UserProfileViewProps) {
  if (presentation === 'inline') {
    return (
      <InlinePresentation
        isDismissable={isDismissable}
        onSignOut={onSignOut}
        onDismiss={onDismiss}
        style={style}
      />
    );
  }

  return (
    <ModalPresentation
      isDismissable={isDismissable}
      onSignOut={onSignOut}
      style={style}
      {...props}
    />
  );
}

// MARK: - Modal Presentation

function ModalPresentation({
  isDismissable,
  onSignOut,
  style,
  ...props
}: Omit<UserProfileViewProps, 'presentation' | 'onDismiss'>) {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const signOutTriggered = useRef(false);

  const onSignOutRef = useRef(onSignOut);
  onSignOutRef.current = onSignOut;
  const clerkRef = useRef(clerk);
  clerkRef.current = clerk;
  const isSignedInRef = useRef(isSignedIn);
  isSignedInRef.current = isSignedIn;

  useEffect(() => {
    signOutTriggered.current = false;
  }, []);

  useEffect(() => {
    if (!isNativeSupported || !ClerkExpo?.presentUserProfile) {
      return;
    }

    const presentModal = async () => {
      try {
        await ClerkExpo.presentUserProfile({
          dismissable: isDismissable ?? true,
        });

        const sessionCheck = await ClerkExpo.getSession?.();
        const hasNativeSession = !!sessionCheck?.session;

        if (!hasNativeSession && !signOutTriggered.current) {
          signOutTriggered.current = true;

          try {
            await ClerkExpo.signOut?.();
          } catch {
            // May already be signed out
          }

          const currentClerk = clerkRef.current;
          if (currentClerk?.signOut) {
            try {
              await currentClerk.signOut();
            } catch (signOutErr) {
              console.warn('[UserProfileView] JS SDK sign out error:', signOutErr);
            }
          }

          onSignOutRef.current?.();
        }
      } catch (err) {
        console.error('[UserProfileView] Error:', err);
      }
    };

    void presentModal();
  }, [isDismissable]);

  if (!isNativeSupported || !ClerkExpo) {
    return (
      <View
        style={[styles.container, style]}
        {...props}
      >
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native UserProfileView is only available on iOS and Android'
            : 'Native UserProfileView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
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

// MARK: - Inline Presentation

function InlinePresentation({
  isDismissable,
  onSignOut,
  onDismiss,
  style,
}: Pick<UserProfileViewProps, 'isDismissable' | 'onSignOut' | 'onDismiss' | 'style'>) {
  const clerk = useClerk();
  const signOutTriggered = useRef(false);

  const handleProfileEvent = useCallback(
    async (event: { nativeEvent: { type: string; data: Record<string, any> } }) => {
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
            console.warn('[UserProfileView] JS SDK sign out error:', err);
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
            ? 'Native UserProfileView is only available on iOS and Android'
            : 'Native UserProfileView requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
