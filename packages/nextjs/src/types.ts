import type { IsomorphicClerkOptions } from '@clerk/clerk-react';
import type { MultiDomainAndOrProxy, PublishableKeyOrFrontendApi } from '@clerk/types';
import type React from 'react';

export type NextClerkProviderProps = {
  children: React.ReactNode;
  /**
   * If set to true, the NextJS middleware will be invoked
   * every time the client-side auth state changes (sign-out, sign-in, organization switch etc.).
   * That way, any auth-dependent logic can be placed inside the middleware.
   * Example: Configuring the middleware to force a redirect to `/sign-in` when the user signs out
   *
   * @default true
   */
  __unstable_invokeMiddlewareOnAuthStateChange?: boolean;
} & Omit<IsomorphicClerkOptions, keyof PublishableKeyOrFrontendApi> &
  Partial<PublishableKeyOrFrontendApi> &
  Omit<IsomorphicClerkOptions, keyof MultiDomainAndOrProxy> &
  MultiDomainAndOrProxy;
