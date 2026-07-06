import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';
import { Platform } from 'react-native';

type AuthEvent = Readonly<{ type: string }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  onAuthEvent?: (event: NativeSyntheticEvent<AuthEvent>) => void;
}

const NativeClerkAuthView =
  Platform.OS === 'ios' || Platform.OS === 'android' ? requireNativeView<NativeProps>('ClerkAuthView') : null;

export default NativeClerkAuthView;
