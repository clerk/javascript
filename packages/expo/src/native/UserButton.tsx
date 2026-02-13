import { useClerk, useUser } from '@clerk/react';
import { Platform } from 'expo-modules-core';
import { useEffect, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Raw result from native module (may vary by platform)
interface NativeSessionResult {
  sessionId?: string;
  session?: { id: string };
  user?: { id: string; firstName?: string; lastName?: string; imageUrl?: string; primaryEmailAddress?: string };
}

// Get the native module for modal presentation (use optional require to avoid crash if not available)
let ClerkExpo: {
  getSession: () => Promise<NativeSessionResult | null>;
  presentUserProfile: (options: { dismissable: boolean }) => Promise<NativeSessionResult | null>;
  signOut: () => Promise<void>;
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

interface NativeUser {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  primaryEmailAddress?: string;
}

/**
 * Props for the UserButton component.
 */
export interface UserButtonProps {
  /**
   * Custom style for the button container.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Callback fired when the user button is pressed.
   *
   * This is called immediately when the button is tapped, before the
   * profile modal is presented. Use this for analytics or custom behavior.
   */
  onPress?: () => void;

  /**
   * Callback fired when the user signs out from the profile modal.
   *
   * This is called after:
   * 1. The native session is cleared
   * 2. The JS SDK session is cleared
   *
   * After this callback, `useAuth()` will return `isSignedIn: false`.
   */
  onSignOut?: () => void;
}

/**
 * A pre-built native button component that displays the user's avatar and opens their profile.
 *
 * `UserButton` renders a circular button showing the user's profile image (or initials if
 * no image is available). When tapped, it presents the {@link UserProfileView} modal for
 * account management.
 *
 * This component is powered by:
 * - **iOS**: clerk-ios (SwiftUI) - https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) - https://github.com/clerk/clerk-android
 *
 * ## Features
 *
 * - **Profile Image**: Displays the user's profile photo from their Clerk account
 * - **Initials Fallback**: Shows user's initials when no profile image is set
 * - **Profile Modal**: Opens {@link UserProfileView} with full account management
 * - **Sign Out Handling**: Properly syncs sign-out between native and JS SDKs
 *
 * ## Avatar Display
 *
 * The button displays the user's avatar in this order of preference:
 * 1. User's profile image from Clerk (if available)
 * 2. First letter of first name + first letter of last name
 * 3. "U" as a fallback
 *
 * ## Styling
 *
 * The button is 36x36 pixels by default with circular border radius.
 * You can customize the size using the `style` prop:
 *
 * ```tsx
 * <UserButton style={{ width: 44, height: 44 }} />
 * ```
 *
 * @example Basic usage in a header
 * ```tsx
 * import { UserButton } from '@clerk/expo/native';
 *
 * export default function Header() {
 *   return (
 *     <View style={styles.header}>
 *       <Text style={styles.title}>My App</Text>
 *       <UserButton />
 *     </View>
 *   );
 * }
 * ```
 *
 * @example With sign-out handling
 * ```tsx
 * <UserButton
 *   onSignOut={() => router.replace('/sign-in')}
 *   style={{ width: 40, height: 40 }}
 * />
 * ```
 *
 * @example With press tracking
 * ```tsx
 * <UserButton
 *   onPress={() => analytics.track('profile_opened')}
 *   onSignOut={() => {
 *     analytics.track('signed_out');
 *     router.replace('/sign-in');
 *   }}
 * />
 * ```
 *
 * @see {@link UserProfileView} The profile view that opens when tapped
 * @see {@link https://clerk.com/docs/components/user/user-button} Clerk UserButton Documentation
 */
export function UserButton({ onPress, onSignOut, style }: UserButtonProps) {
  const [nativeUser, setNativeUser] = useState<NativeUser | null>(null);
  const clerk = useClerk();
  // Use the reactive user hook from clerk-react to observe sign-out state changes
  const { user: clerkUser } = useUser();

  // Fetch native user data on mount and when clerk user changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!isNativeSupported || !ClerkExpo?.getSession) {
        return;
      }

      try {
        const result = await ClerkExpo.getSession();
        const hasSession = !!(result?.sessionId || result?.session?.id);
        if (hasSession && result?.user) {
          setNativeUser(result.user);
        } else {
          // Clear local state if no native session
          setNativeUser(null);
        }
      } catch (err) {
        console.error('[UserButton] Error fetching user:', err);
      }
    };

    fetchUser();
  }, [clerkUser?.id]); // Re-fetch when clerk user changes (including sign-out)

  // Derive the user to display - prefer native data, fall back to clerk-react data
  const user: NativeUser | null =
    nativeUser ??
    (clerkUser
      ? {
          id: clerkUser.id,
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl ?? undefined,
          primaryEmailAddress: clerkUser.primaryEmailAddress?.emailAddress,
        }
      : null);

  const handlePress = async () => {
    onPress?.();

    if (!isNativeSupported || !ClerkExpo?.presentUserProfile) {
      return;
    }

    try {
      await ClerkExpo.presentUserProfile({
        dismissable: true,
      });

      // Check if native session still exists after modal closes
      // If session is null, user signed out from the native UI
      const sessionCheck = await ClerkExpo.getSession?.();
      const hasNativeSession = !!(sessionCheck?.sessionId || sessionCheck?.session?.id);

      if (!hasNativeSession) {
        // Clear local state immediately for instant UI feedback
        setNativeUser(null);

        // Clear native session explicitly (may already be cleared, but ensure it)
        try {
          await ClerkExpo.signOut?.();
        } catch {
          // May already be signed out
        }

        // Sign out from JS SDK to update isSignedIn state
        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch {
            // Even if signOut throws, try to force reload to clear stale state
            const clerkRecord = clerk as unknown as Record<string, unknown>;
            if (typeof clerkRecord.__internal_reloadInitialResources === 'function') {
              try {
                await (clerkRecord.__internal_reloadInitialResources as () => Promise<void>)();
              } catch {
                // Best effort
              }
            }
          }
        }

        onSignOut?.();
      }
    } catch (err) {
      console.error('[UserButton] Error presenting profile:', err);
    }
  };

  // Get initials from user name
  const getInitials = () => {
    if (user?.firstName) {
      const first = user.firstName.charAt(0).toUpperCase();
      const last = user.lastName?.charAt(0).toUpperCase() || '';
      return first + last;
    }
    return 'U';
  };

  // Show fallback when native modules aren't available
  if (!isNativeSupported || !ClerkExpo) {
    return (
      <View style={[styles.button, style]}>
        <Text style={styles.text}>?</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
    >
      {user?.imageUrl ? (
        <Image
          source={{ uri: user.imageUrl }}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatar: {
    flex: 1,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
});
