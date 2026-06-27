import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import { Platform } from 'react-native';

type ProfileEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  isDismissible?: boolean;
  onProfileEvent?: (event: NativeSyntheticEvent<ProfileEvent>) => void;
}

const NativeClerkUserProfileView =
  Platform.OS === 'ios' || Platform.OS === 'android' ? requireNativeView<NativeProps>('ClerkUserProfileView') : null;

export default NativeClerkUserProfileView;
