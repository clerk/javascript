import { ClientContext, useClientContext } from '@clerk/shared/react';
import { assertContextExists } from '@clerk/shared/react/hooks';
import type { SessionResource, SignInResource, SignUpResource } from '@clerk/types';

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
