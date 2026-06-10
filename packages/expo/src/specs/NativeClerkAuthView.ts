import type { ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';
// eslint-disable-next-line import/namespace
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

type AuthEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  onAuthEvent?: BubblingEventHandler<AuthEvent>;
}

export default requireNativeComponent<NativeProps>('ClerkAuthView');
