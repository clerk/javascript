import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';

type AuthEvent = Readonly<{ type: string }>;
type AuthEventHandler = (event: NativeSyntheticEvent<AuthEvent>) => void | Promise<void>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  onAuthEvent?: AuthEventHandler;
}

export default requireNativeComponent<NativeProps>('ClerkAuthView');
