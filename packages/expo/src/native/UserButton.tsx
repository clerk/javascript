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

export interface UserButtonProps extends ViewProps {
  /**
   * Callback fired when the user button is pressed
   */
  onPress?: () => void;

  /**
   * Callback fired when the user signs out from the profile modal
   */
  onSignOut?: () => void;
}

/**
 * Native UserButton component powered by clerk-ios (SwiftUI) and clerk-android (Jetpack Compose)
 *
 * Displays a button that opens the UserProfileView when tapped.
 * Shows the user's profile image, or their initials if no image is available.
 *
 * Uses the official Clerk native packages:
 * - iOS: https://github.com/clerk/clerk-ios
 * - Android: https://github.com/clerk/clerk-android
 *
 * @example
 * ```tsx
 * import { UserButton } from '@clerk/clerk-expo/native';
 *
 * export default function Header() {
 *   return (
 *     <View style={{ flexDirection: 'row', padding: 16 }}>
 *       <UserButton style={{ width: 36, height: 36 }} />
 *     </View>
 *   );
 * }
 * ```
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
            // @ts-expect-error - internal API
            if (clerk?.__internal_reloadInitialResources) {
              try {
                console.log('[UserButton] Force reloading JS SDK state...');
                // @ts-expect-error - internal API
                await clerk.__internal_reloadInitialResources();
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
