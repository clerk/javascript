import React from 'react';
import {
  ClientResource,
  SessionResource,
  SignUpResource,
  SignInResource,
} from '@clerk/types';
import { assertContextExists } from 'ui/contexts/utils';

type CoreClientContextValue = { value: ClientResource };
export const CoreClientContext = React.createContext<
  CoreClientContextValue | undefined
>(undefined);
CoreClientContext.displayName = 'CoreClientContext';

export function useCoreSignIn(): SignInResource {
  const context = React.useContext(CoreClientContext);
  assertContextExists(context, 'CoreClientContextProvider');
  return context.value.signIn;
}

export function useCoreSignUp(): SignUpResource {
  const context = React.useContext(CoreClientContext);
  assertContextExists(context, 'CoreClientContextProvider');
  return context.value.signUp;
}

export function useCoreSessionList(): SessionResource[] {
  const context = React.useContext(CoreClientContext);
  assertContextExists(context, 'CoreClientContextProvider');
  return context.value.sessions;
}
