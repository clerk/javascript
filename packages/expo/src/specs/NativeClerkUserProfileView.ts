import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';

type ProfileEvent = Readonly<{ type: string }>;
type ProfileEventHandler = (event: NativeSyntheticEvent<ProfileEvent>) => void | Promise<void>;

interface NativeProps extends ViewProps {
  isDismissible?: boolean;
  onProfileEvent?: ProfileEventHandler;
}

export default requireNativeComponent<NativeProps>('ClerkUserProfileView');
