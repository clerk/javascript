import type { ClerkProviderProps } from '@clerk/clerk-react';
import type { Without } from '@clerk/types';

export type NextClerkProviderProps = Without<ClerkProviderProps, 'publishableKey'> & {
  /**
   * Used to override the default NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if needed.
   * This is optional for NextJS as the ClerkProvider will automatically use the NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env variable if it exists.
   */
  publishableKey?: string;
  /**
   * If set to true, the NextJS middleware will be invoked
   * every time the client-side auth state changes (sign-out, sign-in, organization switch etc.).
   * That way, any auth-dependent logic can be placed inside the middleware.
   * Example: Configuring the middleware to force a redirect to `/sign-in` when the user signs out
   *
   * @default true
   */
  __unstable_invokeMiddlewareOnAuthStateChange?: boolean;
  /**
   * If set to true, ClerkProvider will opt into dynamic rendering and make auth data available to all wrapper components.
   *
   * @default false
   */
  dynamic?: boolean;
};
