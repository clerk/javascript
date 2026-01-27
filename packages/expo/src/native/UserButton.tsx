import { useClerk, useUser } from '@clerk/react';
import { Platform } from 'expo-modules-core';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewProps, Image } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation (use optional require to avoid crash if not available)
let ClerkExpo: {
  getSession: () => Promise<{
    session?: { id: string };
    user?: { id: string; firstName?: string; lastName?: string; imageUrl?: string; primaryEmailAddress?: string };
  } | null>;
  presentUserProfile: (options: { dismissable: boolean }) => Promise<{ session?: { id: string } } | null>;
  signOut: () => Promise<void>;
} | null = null;
if (isNativeSupported) {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    ClerkExpo = requireNativeModule('ClerkExpo');
  } catch {
    console.log('[UserButton] ClerkExpo native module not available on this platform');
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
export interface UserButtonProps extends ViewProps {
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
export function UserButton({ onPress, onSignOut, style, ...props }: UserButtonProps) {
  const [nativeUser, setNativeUser] = useState<NativeUser | null>(null);
  const clerk = useClerk();
  // Use the reactive user hook from clerk-react to observe sign-out state changes
  const { user: clerkUser, isSignedIn } = useUser();

  // Fetch native user data on mount and when clerk user changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!isNativeSupported || !ClerkExpo?.getSession) {
        return;
      }

      try {
        const session = await ClerkExpo.getSession();
        if (session?.user) {
          setNativeUser(session.user);
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
      console.log('[UserButton] Presenting native profile modal');
      const result = await ClerkExpo.presentUserProfile({
        dismissable: true,
      });

      console.log('[UserButton] Profile modal closed, result:', result);

      // Check if native session still exists after modal closes
      // If session is null, user signed out from the native UI
      const sessionCheck = await ClerkExpo.getSession?.();
      const hasNativeSession = !!sessionCheck?.session;

      console.log('[UserButton] Native session after close:', hasNativeSession);

      if (!hasNativeSession) {
        console.log('[UserButton] User signed out from native profile');
        console.log('[UserButton] JS SDK isSignedIn:', isSignedIn);

        // Clear local state immediately for instant UI feedback
        setNativeUser(null);

        // Clear native session explicitly (may already be cleared, but ensure it)
        try {
          console.log('[UserButton] Clearing native session...');
          await ClerkExpo.signOut?.();
          console.log('[UserButton] Native session cleared');
        } catch (nativeSignOutErr) {
          console.warn('[UserButton] Native sign out error (may already be signed out):', nativeSignOutErr);
        }

        // Sign out from JS SDK - this is critical to update isSignedIn state
        // This will trigger useUser() to update, causing parent components to re-render
        if (clerk?.signOut) {
          try {
            console.log('[UserButton] Signing out from JS SDK...');
            await clerk.signOut();
            console.log('[UserButton] JS SDK signed out successfully');
          } catch (signOutErr) {
            console.warn('[UserButton] JS SDK sign out error:', signOutErr);
            // Even if signOut throws, try to force reload to clear stale state
            if ((clerk as any)?.__internal_reloadInitialResources) {
              try {
                console.log('[UserButton] Force reloading JS SDK state...');
                await (clerk as any).__internal_reloadInitialResources();
                console.log('[UserButton] JS SDK state reloaded');
              } catch (reloadErr) {
                console.warn('[UserButton] Failed to reload JS SDK state:', reloadErr);
              }
            }
          }
        }

        // Call the onSignOut callback AFTER JS SDK sign-out completes
        console.log('[UserButton] Calling onSignOut callback');
        onSignOut?.();
      } else {
        console.log('[UserButton] User dismissed profile without signing out');
        // User just closed the profile, don't trigger sign-out
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

  if (!isNativeSupported) {
    return (
      <View
        style={[styles.button, style]}
        {...props}
      >
        <Text style={styles.text}>?</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      {...props}
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
