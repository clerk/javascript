import React from 'react';

import type { Clerk, ClerkStatus, InitialState, LoadedClerk } from '../types';
import {
  __experimental_CheckoutProvider as CheckoutProvider,
  ClerkInstanceContext,
  InitialStateProvider,
} from './contexts';
import { assertClerkSingletonExists } from './utils';

type ClerkContextProps = {
  clerk: Clerk;
  clerkStatus?: ClerkStatus;
  children: React.ReactNode;
  initialState?: InitialState | Promise<InitialState>;
};

export function ClerkContextProvider(props: ClerkContextProps): JSX.Element | null {
  const clerk = props.clerk as LoadedClerk;

  assertClerkSingletonExists(clerk);

  // The initialState hook has the same check, but it's better to fail early
  if (props.initialState instanceof Promise && !('use' in React && typeof React.use === 'function')) {
    throw new Error('initialState cannot be a promise if React version is less than 19');
  }

  const clerkCtx = React.useMemo(
    () => ({ value: clerk }),
    // clerkStatus is a way to control the referential integrity of the clerk object from the outside,
    // we only change the context value when the status changes. Since clerk is mutable, any read from
    // the object will always be the latest value anyway.
    [props.clerkStatus],
  );

  return (
    <InitialStateProvider initialState={props.initialState}>
      <ClerkInstanceContext.Provider value={clerkCtx}>
        <CheckoutProvider
          // @ts-expect-error - value is not used
          value={undefined}
        >
          {props.children}
        </CheckoutProvider>
      </ClerkInstanceContext.Provider>
    </InitialStateProvider>
  );
}
