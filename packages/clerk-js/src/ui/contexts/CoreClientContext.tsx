import { assertContextExists, ClientContext, useClientContext } from '@clerk/shared';
import { SessionResource, SignInResource, SignUpResource } from '@clerk/types';
import React from 'react';

export const CoreClientContext = ClientContext;

export function useCoreSignIn(): SignInResource {
  const ctx = useClientContext();
  assertContextExists(ctx, CoreClientContext);
  return ctx.signIn;
}

export function useCoreSignUp(): SignUpResource {
  const ctx = useClientContext();
  assertContextExists(ctx, CoreClientContext);
  return ctx.signUp;
}

export function useCoreSessionList(): SessionResource[] {
  const ctx = useClientContext();
  assertContextExists(ctx, CoreClientContext);
  return ctx.sessions;
}
