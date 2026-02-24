import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

type AuthEvent = Readonly<{ type: string; data: string }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissable?: boolean;
  onAuthEvent?: BubblingEventHandler<AuthEvent>;
}

export default codegenNativeComponent<NativeProps>('ClerkAuthView') as HostComponent<NativeProps>;
