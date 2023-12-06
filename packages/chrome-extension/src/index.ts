export * from '@clerk/clerk-react';
export { ContentScript } from './content';
export type { ChromeExtensionClerkProviderProps } from './ClerkProvider';

// order matters since we want override @clerk/clerk-react ClerkProvider
export { ClerkProvider } from './ClerkProvider';
