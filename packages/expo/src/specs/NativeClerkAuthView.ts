// eslint-disable-next-line simple-import-sort/imports, import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
// eslint-disable-next-line import/namespace
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

type AuthEvent = Readonly<{ type: string; data: string }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissable?: boolean;
  onAuthEvent?: BubblingEventHandler<AuthEvent>;
}

export default codegenNativeComponent<NativeProps>('ClerkAuthView') as HostComponent<NativeProps>;
