'use client';

import type { PropsWithChildren } from 'react';
import React from 'react';

import type {
  BillingSubscriptionPlanPeriod,
  ClerkOptions,
  ClientResource,
  ForPayerType,
  LoadedClerk,
  OrganizationResource,
  SignedInSessionResource,
  UserResource,
} from '../types';
import { createContextAndHook } from './hooks/createContextAndHook';
import { SWRConfigCompat } from './providers/SWRConfigCompat';

const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook<LoadedClerk>('ClerkInstanceContext');
const [UserContext, useUserContext] = createContextAndHook<UserResource | null | undefined>('UserContext');
const [ClientContext, useClientContext] = createContextAndHook<ClientResource | null | undefined>('ClientContext');
const [SessionContext, useSessionContext] = createContextAndHook<SignedInSessionResource | null | undefined>(
  'SessionContext',
);

const OptionsContext = React.createContext<ClerkOptions>({});

/**
 * @interface
 */
export type UseCheckoutOptions = {
  /**
   * Specifies if the checkout is for an organization.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  /**
   * The billing period for the plan.
   */
  planPeriod: BillingSubscriptionPlanPeriod;
  /**
   * The ID of the subscription plan to check out (e.g. `cplan_xxx`).
   */
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
    <SWRConfigCompat swrConfig={swrConfig}>
      <OrganizationContextInternal.Provider
        value={{
          value: { organization },
        }}
      >
        {children}
      </OrganizationContextInternal.Provider>
    </SWRConfigCompat>
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
  __experimental_CheckoutProvider,
  ClerkInstanceContext,
  ClientContext,
  OptionsContext,
  OrganizationProvider,
  SessionContext,
  useAssertWrappedByClerkProvider,
  useCheckoutContext,
  useClerkInstanceContext,
  useClientContext,
  useOptionsContext,
  useOrganizationContext,
  UserContext,
  useSessionContext,
  useUserContext,
};
