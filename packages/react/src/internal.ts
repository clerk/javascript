export { setErrorThrowerOptions } from './errors/errorThrower';
export { MultisessionAppSupport } from './components/controlComponents';
export { useRoutingProps } from './hooks/useRoutingProps';
export { useDerivedAuth } from './hooks/useAuth';
export { IS_REACT_SHARED_VARIANT_COMPATIBLE } from './utils/versionCheck';

export {
  clerkJSScriptUrl,
  buildClerkJSScriptAttributes,
  clerkUIScriptUrl,
  buildClerkUIScriptAttributes,
  setClerkJSLoadingErrorPackageName,
  // Deprecated aliases - will be removed in a future major version
  clerkJsScriptUrl,
  buildClerkJsScriptAttributes,
  setClerkJsLoadingErrorPackageName,
} from '@clerk/shared/loadClerkJsScript';

export type { Ui } from '@clerk/ui/internal';

export type { InternalClerkScriptProps } from '@clerk/shared/types';

import type { InternalClerkScriptProps } from '@clerk/shared/types';
import type { Ui } from '@clerk/ui/internal';
import type React from 'react';

import type { ClerkProviderProps } from './types';

import { ClerkProvider } from './contexts/ClerkProvider';

/**
 * A wider-typed version of ClerkProvider that accepts internal script props.
 * Framework SDKs should use this instead of the public ClerkProvider.
 */
export const InternalClerkProvider = ClerkProvider as unknown as (<TUi extends Ui = Ui>(
  props: ClerkProviderProps<TUi> & InternalClerkScriptProps,
) => React.JSX.Element) & { displayName: string };
