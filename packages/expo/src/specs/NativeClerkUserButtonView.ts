import { requireNativeView } from 'expo';
import type { ViewProps } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NativeProps extends ViewProps {}

export default requireNativeView<NativeProps>('ClerkUserButtonView');
