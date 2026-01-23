import { useClerk } from '@clerk/react';
import { Platform } from 'expo-modules-core';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewProps, Image } from 'react-native';

// Check if native module is supported on this platform
const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Get the native module for modal presentation (use optional require to avoid crash if not available)
let ClerkExpo: {
  getSession: () => Promise<{
    user?: { id: string; firstName?: string; lastName?: string; imageUrl?: string; primaryEmailAddress?: string };
  } | null>;
  presentUserProfile: (options: { dismissable: boolean }) => Promise<{ sessionId?: string } | null>;
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
  const [user, setUser] = useState<NativeUser | null>(null);
  const clerk = useClerk();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isNativeSupported || !ClerkExpo?.getSession) {
        return;
      }

      try {
        const session = await ClerkExpo.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('[UserButton] Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

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

      // If the modal returned a result, it means the user signed out
      // The native SDK returns the sessionId when sign-out completes
      if (result?.sessionId) {
        console.log('[UserButton] Sign out event received, sessionId:', result.sessionId);

        // Also sign out from JS SDK to ensure both native and JS states are cleared
        if (clerk?.signOut) {
          try {
            console.log('[UserButton] Signing out from JS SDK...');
            await clerk.signOut();
            console.log('[UserButton] JS SDK signed out');
          } catch (signOutErr) {
            console.warn('[UserButton] JS SDK sign out error (may already be signed out):', signOutErr);
          }
        }

        // Call the onSignOut callback if provided
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
