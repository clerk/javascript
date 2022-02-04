import { ActiveSessionResource, SessionResource } from '@clerk/types';
import React, { useContext } from 'react';

import { hocChildrenNotAFunctionError } from '../errors';
import { inBrowser } from '../utils';
import {
  assertUserGuarantee,
  assertWrappedByClerkProvider,
} from './assertHelpers';
import { StructureContext, StructureContextStates } from './StructureContext';

type SessionTypes = ActiveSessionResource | null | undefined;
type SessionContextValue = { value: SessionTypes };
export const SessionContext = React.createContext<
  SessionContextValue | undefined
>(undefined);
SessionContext.displayName = 'SessionContext';

export function useSessionContext(): SessionContextValue {
  const sessionCtx = useContext(SessionContext);
  assertWrappedByClerkProvider(sessionCtx);
  return sessionCtx;
}

type UseSessionWithAssertionsResponse = {
  session: SessionTypes;
  isLoading: (session: SessionTypes) => session is undefined;
  isSignedOut: (session: SessionTypes) => session is null;
  isSignedIn: (session: SessionTypes) => session is ActiveSessionResource;
};

export function useSession(options?: {
  withAssertions: false;
}): ActiveSessionResource;
export function useSession(options: {
  withAssertions: true;
}): UseSessionWithAssertionsResponse;
export function useSession(options?: {
  withAssertions: boolean;
}): ActiveSessionResource | UseSessionWithAssertionsResponse {
  const opts = { ...options };
  opts.withAssertions = opts.withAssertions || false;

  const structureCtx = useContext(StructureContext);
  const sessionCtx = useSessionContext();

  if (opts.withAssertions) {
    const assertions = {
      isLoading: (session: SessionTypes): session is undefined => {
        return session === undefined;
      },
      isSignedOut: (session: SessionTypes): session is null => {
        return session === null;
      },
      isSignedIn: (session: SessionTypes): session is ActiveSessionResource => {
        return session !== undefined && session !== null;
      },
    };
    const session = sessionCtx.value;
    return { session, ...assertions };
  }

  assertWrappedByClerkProvider(structureCtx);
  assertUserGuarantee(structureCtx.guaranteedUser, 'useSession()');
  assertUserGuarantee(sessionCtx.value, 'useSession()');
  return sessionCtx.value;
}

export const withSession = <P extends { session: SessionResource }>(
  Component: React.ComponentType<P>,
  displayName?: string,
) => {
  displayName =
    displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC: React.FC<Omit<P, 'session'>> = (props: Omit<P, 'session'>) => {
    const structureCtx = useContext(StructureContext);
    const sessionCtx = useContext(SessionContext);
    if (!inBrowser()) {
      return null;
    }
    assertWrappedByClerkProvider(structureCtx);
    assertWrappedByClerkProvider(sessionCtx);
    const session = sessionCtx.value;

    if (structureCtx.guaranteedUser && session) {
      return <Component {...(props as P)} session={session} />;
    }

    if (session) {
      return (
        <StructureContext.Provider value={StructureContextStates.guaranteedAll}>
          <Component {...(props as P)} session={session} />
        </StructureContext.Provider>
      );
    }

    return null;
  };

  HOC.displayName = `withSession(${displayName})`;
  return HOC;
};

export const WithSession: React.FC<{
  children: (session: SessionResource) => React.ReactNode;
}> = ({ children }) => (
  <StructureContext.Consumer>
    {structureCtx => (
      <SessionContext.Consumer>
        {sessionCtx => {
          if (typeof children !== 'function') {
            throw new Error(hocChildrenNotAFunctionError);
          }

          assertWrappedByClerkProvider(structureCtx);
          assertWrappedByClerkProvider(sessionCtx);
          const session = sessionCtx.value;

          if (structureCtx.guaranteedUser && session) {
            return children(session);
          }

          if (session) {
            return (
              <StructureContext.Provider
                value={StructureContextStates.guaranteedAll}
              >
                {children(session)}
              </StructureContext.Provider>
            );
          }

          return null;
        }}
      </SessionContext.Consumer>
    )}
  </StructureContext.Consumer>
);
