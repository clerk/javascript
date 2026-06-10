import type { ViewProps } from 'react-native';
import { requireNativeComponent } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NativeProps extends ViewProps {}

export default requireNativeComponent<NativeProps>('ClerkUserButtonView');
