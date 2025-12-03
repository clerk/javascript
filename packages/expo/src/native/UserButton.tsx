import { requireNativeModule, Platform } from 'expo-modules-core';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewProps, Image } from 'react-native';

// Get the native module for modal presentation
const ClerkExpo = Platform.OS === 'ios' ? requireNativeModule('ClerkExpo') : null;

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
}

/**
 * Native iOS UserButton component powered by clerk-ios SwiftUI
 *
 * Displays a button that opens the UserProfileView when tapped.
 * Shows the user's profile image, or their initials if no image is available.
 *
 * Uses the official clerk-ios package from:
 * https://github.com/clerk/clerk-ios
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
export function UserButton({ onPress, style, ...props }: UserButtonProps) {
  const [user, setUser] = useState<NativeUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (Platform.OS !== 'ios' || !ClerkExpo?.getSession) {
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

    if (Platform.OS !== 'ios' || !ClerkExpo?.presentUserProfile) {
      return;
    }

    try {
      console.log('[UserButton] Presenting native profile modal');
      await ClerkExpo.presentUserProfile({
        dismissable: true,
      });
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

  if (Platform.OS !== 'ios') {
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
