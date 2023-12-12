export * from '@clerk/clerk-react';
export type { StorageCache } from './utils/storage';

// The order matters since we want override @clerk/clerk-react ClerkProvider
export { ClerkProvider } from './ClerkProvider';

// Override Clerk React error thrower to show that errors come from @clerk/chrome-extension
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
