import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

type ProfileEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  isDismissible?: boolean;
  hostBackButton?: boolean;
  onProfileEvent?: (event: NativeSyntheticEvent<ProfileEvent>) => void;
  onHostBack?: (event: NativeSyntheticEvent<object>) => void;
}

export default requireNativeView<NativeProps>('ClerkUserProfileView');
