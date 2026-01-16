import './polyfills';
import './types/appearance';

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
