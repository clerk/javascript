import { requireNativeModule, Platform } from 'expo-modules-core';
import { TouchableOpacity, View, Text, StyleSheet, ViewProps } from 'react-native';

// Get the native module for modal presentation
const ClerkExpo = Platform.OS === 'ios' ? requireNativeModule('ClerkExpo') : null;

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
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>U</Text>
      </View>
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
