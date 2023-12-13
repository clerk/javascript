import './polyfills';

import { setErrorThrowerOptions } from './errors/errorThrower';

export * from './components';
export * from './contexts';

export * from './hooks';
export { useEmailLink } from './hooks/useEmailLink';
export type {
  BrowserClerk,
  ClerkProp,
  HeadlessBrowserClerk,
  ClerkProviderOptionsWrapper,
  ClerkProviderProps,
} from './types';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
