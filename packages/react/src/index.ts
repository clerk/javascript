import './polyfills';

import { setClerkJsLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';

import { setErrorThrowerOptions } from './errors/errorThrower';

export * from './components';
export * from './contexts';

export * from './hooks';
export type { BrowserClerk, ClerkProp, HeadlessBrowserClerk, ClerkProviderProps } from './types';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJsLoadingErrorPackageName(PACKAGE_NAME);
