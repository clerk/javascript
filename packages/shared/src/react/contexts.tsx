'use client';

import type {
  ClerkOptions,
  ClientResource,
  CommerceSubscriptionPlanPeriod,
  LoadedClerk,
  OrganizationResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { SWRConfig } from './clerk-swr';
import { createContextAndHook } from './hooks/createContextAndHook';

const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook<LoadedClerk>('ClerkInstanceContext');
const [UserContext, useUserContext] = createContextAndHook<UserResource | null | undefined>('UserContext');
const [ClientContext, useClientContext] = createContextAndHook<ClientResource | null | undefined>('ClientContext');
const [SessionContext, useSessionContext] = createContextAndHook<SignedInSessionResource | null | undefined>(
  'SessionContext',
);

const OptionsContext = React.createContext<ClerkOptions>({});

type UseCheckoutOptions = {
  for?: 'organization';
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

const [CheckoutContext, useCheckoutContext] = createContextAndHook<UseCheckoutOptions>('CheckoutContext');

const __experimental_CheckoutProvider = ({ children, ...rest }: PropsWithChildren<UseCheckoutOptions>) => {
  return <CheckoutContext.Provider value={{ value: rest }}>{children}</CheckoutContext.Provider>;
};

/**
 * @internal
 */
function useOptionsContext(): ClerkOptions {
  const context = React.useContext(OptionsContext);
  if (context === undefined) {
    throw new Error('useOptions must be used within an OptionsContext');
  }
  return context;
}

type OrganizationContextProps = {
  organization: OrganizationResource | null | undefined;
};
const [OrganizationContextInternal, useOrganizationContext] = createContextAndHook<{
  organization: OrganizationResource | null | undefined;
}>('OrganizationContext');

const OrganizationProvider = ({
  children,
  organization,
  swrConfig,
}: PropsWithChildren<
  OrganizationContextProps & {
    // Exporting inferred types  directly from SWR will result in error while building declarations
    swrConfig?: any;
  }
>) => {
  return (
    <SWRConfig value={swrConfig}>
      <OrganizationContextInternal.Provider
        value={{
          value: { organization },
        }}
      >
        {children}
      </OrganizationContextInternal.Provider>
    </SWRConfig>
  );
};

/**
 * @internal
 */
function useAssertWrappedByClerkProvider(displayNameOrFn: string | (() => void)): void {
  const ctx = React.useContext(ClerkInstanceContext);

  if (!ctx) {
    if (typeof displayNameOrFn === 'function') {
      displayNameOrFn();
      return;
    }

    throw new Error(
      `${displayNameOrFn} can only be used within the <ClerkProvider /> component.

Possible fixes:
1. Ensure that the <ClerkProvider /> is correctly wrapping your application where this component is used.
2. Check for multiple versions of the \`@clerk/shared\` package in your project. Use a tool like \`npm ls @clerk/shared\` to identify multiple versions, and update your dependencies to only rely on one.

Learn more: https://clerk.com/docs/components/clerk-provider`.trim(),
    );
  }
}

export {
  ClientContext,
  useClientContext,
  OrganizationProvider,
  useOrganizationContext,
  UserContext,
  OptionsContext,
  useOptionsContext,
  useUserContext,
  SessionContext,
  useSessionContext,
  ClerkInstanceContext,
  useClerkInstanceContext,
  useCheckoutContext,
  __experimental_CheckoutProvider,
  useAssertWrappedByClerkProvider,
};
