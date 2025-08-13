export * from './react/re-exports';

export type { StorageCache } from './internal/utils/storage';

// The order matters since we want override @clerk/clerk-react components
export { ClerkProvider, GoogleOneTap } from './react';

// Override Clerk React error thrower to show that errors come from @clerk/chrome-extension
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
