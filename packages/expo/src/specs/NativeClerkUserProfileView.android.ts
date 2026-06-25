import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

type ProfileEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  isDismissible?: boolean;
  onProfileEvent?: (event: NativeSyntheticEvent<ProfileEvent>) => void;
}

export default requireNativeView<NativeProps>('ClerkUserProfileView');
