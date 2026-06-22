import { requireNativeView } from 'expo';
import type { ViewProps } from 'react-native';

type ProfileEvent = Readonly<{ type: string }>;
type NativeEvent<T> = Readonly<{ nativeEvent: T }>;

interface NativeProps extends ViewProps {
  isDismissible?: boolean;
  onProfileEvent?: (event: NativeEvent<ProfileEvent>) => void;
}

export default requireNativeView<NativeProps>('ClerkUserProfileView');
