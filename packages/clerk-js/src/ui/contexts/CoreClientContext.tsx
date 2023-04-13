import { assertContextExists, ClientContext, useClientContext } from '@clerk/shared';
import type { SessionResource, SignInResource, SignUpResource } from '@clerk/types';

export const CoreClientContext = ClientContext;

export function useCoreSignIn(): SignInResource {
  const ctx = useClientContext();
  assertContextExists(ctx, CoreClientContext);
  // TODO: remove this
  return { ...ctx.signIn, isResetFlow: true };
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
