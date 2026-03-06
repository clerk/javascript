import React from 'react';

import type { ClerkProviderValue, ClerkStatus, InitialState, LoadedClerk } from '../types';
import {
  __experimental_CheckoutProvider as CheckoutProvider,
  ClerkInstanceContext,
  InitialStateProvider,
} from './contexts';
import { assertClerkSingletonExists } from './utils';

type ClerkContextProps = {
  /**
   * The Clerk instance to provide to the application.
   * Accepts ClerkProviderValue which is compatible with IsomorphicClerk.
   */
  clerk: ClerkProviderValue;
  clerkStatus?: ClerkStatus;
  children: React.ReactNode;
  initialState?: InitialState | Promise<InitialState>;
};

export function ClerkContextProvider(props: ClerkContextProps): JSX.Element | null {
  // SAFETY: This cast is safe because ClerkProviderValue is structurally compatible
  // with LoadedClerk at runtime. The type difference exists because IsomorphicClerk
  // wraps methods to allow void returns during pre-mount queuing. By the time
  // consumers access the clerk instance, it is fully functional.
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
