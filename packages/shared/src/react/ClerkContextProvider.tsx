import React from 'react';

import type { Clerk, ClerkStatus, InitialState, LoadedClerk } from '../types';
import {
  __experimental_CheckoutProvider as CheckoutProvider,
  ClerkInstanceContext,
  InitialStateProvider,
} from './contexts';
import { SWRConfigCompat } from './providers/SWRConfigCompat';
import { assertClerkSingletonExists } from './utils';

type ClerkContextProps = {
  clerk: Clerk;
  clerkStatus?: ClerkStatus;
  children: React.ReactNode;
  swrConfig?: any;
  initialState?: InitialState;
};

export function ClerkContextProvider(props: ClerkContextProps): JSX.Element | null {
  const clerk = props.clerk as LoadedClerk;

  assertClerkSingletonExists(clerk);

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
        <SWRConfigCompat swrConfig={props.swrConfig}>
          <CheckoutProvider
            // @ts-expect-error - value is not used
            value={undefined}
          >
            {props.children}
          </CheckoutProvider>
        </SWRConfigCompat>
      </ClerkInstanceContext.Provider>
    </InitialStateProvider>
  );
}
