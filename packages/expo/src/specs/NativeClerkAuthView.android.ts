import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

type AuthEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  logoMaxHeight?: number;
  onAuthEvent?: (event: NativeSyntheticEvent<AuthEvent>) => void;
}

export default requireNativeView<NativeProps>('ClerkAuthView');
