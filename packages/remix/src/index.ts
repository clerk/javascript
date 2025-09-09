import './globalPolyfill';

import { logger } from '@clerk/shared/logger';

logger.warnOnce(`
Clerk - DEPRECATION WARNING: @clerk/remix is now in maintenance mode.

@clerk/remix will only receive security updates. No new features will be added.

Please migrate to @clerk/react-router for continued development and new features:

Migration guide: https://reactrouter.com/upgrading/remix
React Router SDK: https://clerk.com/docs/quickstarts/react-router
`);

export * from './client';

// Override Clerk React error thrower to show that errors come from @clerk/remix
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
