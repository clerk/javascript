import { useUser } from '@clerk/react';
import { useEffect, useState } from 'react';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';

// Raw result from native module (may vary by platform)
interface NativeSessionResult {
  sessionId?: string;
  session?: { id: string };
  user?: { id: string; firstName?: string; lastName?: string; imageUrl?: string; primaryEmailAddress?: string };
}

function getInitials(user: { firstName?: string; lastName?: string } | null): string {
  if (user?.firstName) {
    const first = user.firstName.charAt(0).toUpperCase();
    const last = user.lastName?.charAt(0).toUpperCase() || '';
    return first + last;
  }
  return 'U';
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
   * Called when the button is pressed.
   *
   * Use this to present your own `UserProfileView` sheet, modal, or route.
   */
  onPress?: (event: GestureResponderEvent) => void;

  /**
   * Style applied to the button container.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A pre-built button component that displays the user's avatar.
 *
 * `UserButton` renders a circular button showing the user's profile image (or initials if
 * no image is available). Use `onPress` to present your own `UserProfileView` sheet,
 * modal, or route.
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
 * @example Presenting the profile in an app-owned modal
 * ```tsx
 * import { UserButton, UserProfileView } from '@clerk/expo/native';
 *
 * export default function Header() {
 *   const [isProfileOpen, setIsProfileOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <UserButton
 *         onPress={() => setIsProfileOpen(true)}
 *         style={{ width: 40, height: 40 }}
 *       />
 *       <Modal visible={isProfileOpen}>
 *         <UserProfileView isDismissable />
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 *
 * @see {@link UserProfileView} The profile view to render in your own presentation surface
 * @see {@link https://clerk.com/docs/components/user/user-button} Clerk UserButton Documentation
 */
export function UserButton({ onPress, style }: UserButtonProps) {
  const [nativeUser, setNativeUser] = useState<NativeUser | null>(null);
  const { user: clerkUser } = useUser();

  // Fetch native user data on mount and when clerk user changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!isNativeSupported || !ClerkExpo?.getSession) {
        return;
      }

      try {
        const result = (await ClerkExpo.getSession()) as NativeSessionResult | null;
        const hasSession = !!(result?.sessionId || result?.session?.id);
        if (hasSession && result?.user) {
          setNativeUser(result.user);
        } else {
          // Clear local state if no native session
          setNativeUser(null);
        }
      } catch (err) {
        if (__DEV__) {
          console.error('[UserButton] Error fetching user:', err);
        }
      }
    };

    void fetchUser();
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
      onPress={onPress}
      style={[styles.button, style]}
    >
      {user?.imageUrl ? (
        <Image
          source={{ uri: user.imageUrl }}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 9999,
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
