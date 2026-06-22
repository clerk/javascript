import { requireNativeView } from 'expo';
import type { ViewProps } from 'react-native';

type AuthEvent = Readonly<{ type: string }>;
type NativeEvent<T> = Readonly<{ nativeEvent: T }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  onAuthEvent?: (event: NativeEvent<AuthEvent>) => void;
}

export default requireNativeView<NativeProps>('ClerkAuthView');
