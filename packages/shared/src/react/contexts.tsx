'use client';

import type { PropsWithChildren } from 'react';
import React, { useState } from 'react';

import type { BillingSubscriptionPlanPeriod, ClerkOptions, ForPayerType, InitialState, LoadedClerk } from '../types';
import { createContextAndHook } from './hooks/createContextAndHook';

const [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook<LoadedClerk>('ClerkInstanceContext');

const [InitialStateContext, _useInitialStateContext] = createContextAndHook<
  InitialState | Promise<InitialState> | undefined
>('InitialStateContext');

/**
 * Provides initial Clerk state (session, user, organization data) from server-side rendering
 * to child components via React context.
 *
 * Passing in a promise is only supported for React >= 19.
 *
 * The initialState is snapshotted on mount and cannot change during the component lifecycle.
 *
 * Note that different parts of the React tree can use separate InitialStateProvider instances
 * with different initialState values if needed.
 */
export function InitialStateProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: InitialState | Promise<InitialState> | undefined;
}) {
  // The initialState is not allowed to change, we snapshot it to turn that expectation into a guarantee.
  // Note that despite this, it could still be different for different parts of the React tree which is fine,
  // but that requires using a separate provider.
  // eslint-disable-next-line react/hook-use-state
  const [initialStateSnapshot] = useState(initialState);
  const initialStateCtx = React.useMemo(() => ({ value: initialStateSnapshot }), [initialStateSnapshot]);
  return <InitialStateContext.Provider value={initialStateCtx}>{children}</InitialStateContext.Provider>;
}

export function useInitialStateContext(): InitialState | undefined {
  const initialState = _useInitialStateContext();

  if (initialState instanceof Promise) {
    if ('use' in React && typeof React.use === 'function') {
      return React.use(initialState);
    } else {
      throw new Error('initialState cannot be a promise if React version is less than 19');
    }
  }

  return initialState;
}

const OptionsContext = React.createContext<ClerkOptions>({});

/**
 * @interface
 */
export type UseCheckoutOptions = {
  /**
   * Specifies if the checkout is for an Organization.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  /**
   * The billing period for the Plan.
   */
  planPeriod: BillingSubscriptionPlanPeriod;
  /**
   * The ID of the Subscription Plan to check out (e.g. `cplan_xxx`).
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
  OptionsContext,
  useAssertWrappedByClerkProvider,
  useCheckoutContext,
  useClerkInstanceContext,
  useOptionsContext,
};
