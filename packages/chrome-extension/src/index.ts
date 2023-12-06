export * from '@clerk/clerk-react';
export type { ChromeExtensionClerkProviderProps } from './ClerkProvider';

// order matters since we want override @clerk/clerk-react ClerkProvider
export { ClerkProvider } from './ClerkProvider';
