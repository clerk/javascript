import { assertContextExists, ClientContext, useClientContext } from '@clerk/shared/react';
import type { SignInResource, SignUpResource } from '@clerk/types';

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
