import type { LoadedClerk } from '@clerk/types';
import { useStore } from '@nanostores/react';
import { computed } from 'nanostores';
import React from 'react';

import { $clerk, $csrState } from '../../stores/internal';

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

export const assertSingleChild =
  (children: React.ReactNode) =>
  (name: 'SignInButton' | 'SignUpButton' | 'SignOutButton' | 'SignInWithMetamaskButton') => {
    try {
      return React.Children.only(children);
    } catch (e) {
      return `You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;
    }
  };

export const normalizeWithDefaultValue = (children: React.ReactNode | undefined, defaultText: string) => {
  if (!children) {
    children = defaultText;
  }
  if (typeof children === 'string') {
    children = <button type='button'>{children}</button>;
  }
  return children;
};

export const safeExecute =
  (cb: unknown) =>
  (...args: any) => {
    if (cb && typeof cb === 'function') {
      return cb(...args);
    }
  };
