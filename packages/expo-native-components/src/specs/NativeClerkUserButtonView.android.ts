import { requireNativeView } from 'expo';
import type { ViewProps } from 'react-native';

// Codegen requires an interface declaration in the iOS spec; keep the Android
// view prop shape identical for the shared React wrapper.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NativeProps extends ViewProps {}

export default requireNativeView<NativeProps>('ClerkUserButtonView');
