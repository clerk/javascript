export * from '@clerk/backend';

import { logger } from '@clerk/shared/logger';

logger.warnOnce(`
Clerk - DEPRECATION WARNING: \`@clerk/react-router/api.server\` has been deprecated and will be removed in the next major version.

Import from \`@clerk/react-router/server\` instead.

Before:
  import { getAuth, clerkMiddleware, rootAuthLoader } from '@clerk/react-router/api.server';

After:
  import { getAuth, clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server';
`);
