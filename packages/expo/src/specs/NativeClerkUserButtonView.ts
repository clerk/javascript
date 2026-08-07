import { requireNativeView } from 'expo';
import type { ViewProps } from 'react-native';
import { Platform } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NativeProps extends ViewProps {}

const NativeClerkUserButtonView =
  Platform.OS === 'ios' || Platform.OS === 'android' ? requireNativeView<NativeProps>('ClerkUserButtonView') : null;

export default NativeClerkUserButtonView;
