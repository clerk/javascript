import type { LoadedClerk } from '@clerk/shared/types';
import { computed, type Store, type StoreValue } from 'nanostores';
import React from 'react';

import { $clerk, $csrState } from '../stores/internal';

/**
 * This implementation of `useStore` is an alternative solution to the hook exported by nanostores
 * Reference: https://github.com/nanostores/react/blob/main/index.js
 */
function useStore<T extends Store, SV extends StoreValue<T>>(store: T): SV {
  const get = store.get.bind(store);
  return React.useSyncExternalStore(store.listen, get, get);
}

export const withClerk = <P extends { clerk: LoadedClerk | undefined | null }>(
  Component: React.ComponentType<P>,
  displayName?: string,
) => {
  displayName = displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  const HOC = (props: Omit<P, 'clerk'>) => {
    const clerk = useStore(
      computed([$csrState, $clerk], (state, clerk) => {
        return state.isLoaded ? clerk : null;
      }),
    );

    return (
      <Component
        /**
         * Force the remount of the component if clerk is not loaded yet.
         * This is needed in order to avoid hydration errors in controlComponents.
         */
        key={clerk ? 'a' : 'b'}
        {...(props as P)}
        clerk={clerk}
      />
    );
  };
  HOC.displayName = `withClerk(${displayName})`;
  return HOC;
};

export type WithClerkProp<T = unknown> = T & {
  clerk: LoadedClerk | undefined | null;
};

// TODO-SHARED: Duplicate from @clerk/react
export const assertSingleChild =
  (children: React.ReactNode) =>
  (
    name:
      | 'SignInButton'
      | 'SignUpButton'
      | 'SignOutButton'
      | 'SignInWithMetamaskButton'
      | 'SubscriptionDetailsButton'
      | 'CheckoutButton'
      | 'PlanDetailsButton',
  ) => {
    try {
      return React.Children.only(children);
    } catch {
      return `You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;
    }
  };

// TODO-SHARED: Duplicate from @clerk/react
export const normalizeWithDefaultValue = (children: React.ReactNode | undefined, defaultText: string) => {
  if (!children) {
    children = defaultText;
  }
  if (typeof children === 'string') {
    children = <button type='button'>{children}</button>;
  }
  return children;
};

// TODO-SHARED: Duplicate from @clerk/react
export const safeExecute =
  (cb: unknown) =>
  (...args: any) => {
    if (cb && typeof cb === 'function') {
      return cb(...args);
    }
  };
