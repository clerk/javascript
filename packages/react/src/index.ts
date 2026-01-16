import './polyfills';
import './types/appearance';
// Register React on the global shared modules registry.
// This enables @clerk/ui's shared variant to use the host app's React
// instead of bundling its own copy, reducing overall bundle size.
import '@clerk/ui/register';

import { setClerkJsLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';

import { setErrorThrowerOptions } from './errors/errorThrower';

export * from './components';
export * from './contexts';

export * from './hooks';
export { getToken } from '@clerk/shared/getToken';
export type {
  BrowserClerk,
  BrowserClerkConstructor,
  ClerkProp,
  HeadlessBrowserClerk,
  HeadlessBrowserClerkConstructor,
  IsomorphicClerkOptions,
} from '@clerk/shared/types';
export type { ClerkProviderProps } from './types';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJsLoadingErrorPackageName(PACKAGE_NAME);
