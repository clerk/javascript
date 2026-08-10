import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

type AuthEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  logoMaxHeight?: number;
  hostBackButton?: boolean;
  onAuthEvent?: (event: NativeSyntheticEvent<AuthEvent>) => void;
  onHostBack?: (event: NativeSyntheticEvent<object>) => void;
}

export default requireNativeView<NativeProps>('ClerkAuthView');
