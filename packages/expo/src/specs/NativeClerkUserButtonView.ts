/* eslint-disable import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member, simple-import-sort/imports */
// These deep imports from react-native internals are required by codegen.
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
/* eslint-enable import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member, simple-import-sort/imports */

// Codegen requires an interface declaration here; a type alias fails Android codegen.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>('ClerkUserButtonView') as HostComponent<NativeProps>;
