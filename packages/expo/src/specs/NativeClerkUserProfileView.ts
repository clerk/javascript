// eslint-disable-next-line simple-import-sort/imports, import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
// eslint-disable-next-line import/namespace
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

type ProfileEvent = Readonly<{ type: string; data: string }>;

interface NativeProps extends ViewProps {
  isDismissable?: boolean;
  onProfileEvent?: BubblingEventHandler<ProfileEvent>;
}

export default codegenNativeComponent<NativeProps>('ClerkUserProfileView') as HostComponent<NativeProps>;
