/* eslint-disable import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member, simple-import-sort/imports */
// These deep imports from react-native internals are required by codegen.
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent, ViewProps } from 'react-native';
import type { BubblingEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
/* eslint-enable import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member, simple-import-sort/imports */

type OrganizationEvent = Readonly<{ type: string; data: string }>;

interface NativeProps extends ViewProps {
  hidePersonal?: boolean;
  onOrganizationEvent?: BubblingEventHandler<OrganizationEvent>;
}

export default codegenNativeComponent<NativeProps>('ClerkOrganizationSwitcherView') as HostComponent<NativeProps>;
