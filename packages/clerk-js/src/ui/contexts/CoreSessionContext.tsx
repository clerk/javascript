import React from 'react';
import { assertContextExists } from 'ui/contexts/utils';
import { SessionResource } from '@clerk/types';
import { clerkCoreErrorSessionIsNotDefined } from 'core/errors';

type CoreSessionContextValue = { value: SessionResource | null | undefined };
export const CoreSessionContext = React.createContext<
  CoreSessionContextValue | undefined
>(undefined);
CoreSessionContext.displayName = 'CoreSessionContext';

type Opts = {
  avoidUndefinedCheck?: boolean;
};

export function useCoreSession(): SessionResource;
export function useCoreSession(opts: {
  avoidUndefinedCheck: true;
}): SessionResource | null | undefined;

export function useCoreSession(
  opts?: Opts,
): SessionResource | null | undefined {
  const context = React.useContext(CoreSessionContext);
  assertContextExists(context, 'ClerkSessionContextProvider');
  if (!context.value && !!opts && !opts.avoidUndefinedCheck) {
    clerkCoreErrorSessionIsNotDefined();
  }
  return context.value;
}

export function withCoreSessionSwitchGuard<P>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  const Hoc = (props: P) => {
    const context = React.useContext(CoreSessionContext);
    assertContextExists(context, 'CoreSessionContextProvider');
    if (context.value === undefined) {
      return null;
    }
    return <Component {...(props as P)} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  Hoc.displayName = displayName;
  return Hoc;
}
