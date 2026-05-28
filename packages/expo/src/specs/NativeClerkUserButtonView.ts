/* eslint-disable import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member, simple-import-sort/imports */
// These deep imports from react-native internals are required by codegen.
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
/* eslint-enable import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member, simple-import-sort/imports */

type NativeProps = ViewProps;

export default codegenNativeComponent<NativeProps>('ClerkUserButtonView') as HostComponent<NativeProps>;
