import type { ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';
// eslint-disable-next-line import/namespace
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

type ProfileEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  isDismissible?: boolean;
  onProfileEvent?: BubblingEventHandler<ProfileEvent>;
}

export default requireNativeComponent<NativeProps>('ClerkUserProfileView');
