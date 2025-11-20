import { assertContextExists, useClientContext } from '@clerk/shared/react';
import type { SignInResource, SignUpResource } from '@clerk/shared/types';

export function useCoreSignIn(): SignInResource {
  const ctx = useClientContext();
  // TODO: useClientContext doesn't actually rely on a context anymore, so we should update this message
  assertContextExists(ctx, 'ClientContext');
  return ctx.signIn;
}

export function useCoreSignUp(): SignUpResource {
  const ctx = useClientContext();
  // TODO: useClientContext doesn't actually rely on a context anymore, so we should update this message
  assertContextExists(ctx, 'ClientContext');
  return ctx.signUp;
}
