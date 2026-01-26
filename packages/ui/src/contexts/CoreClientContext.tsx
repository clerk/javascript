import { useClientContext } from '@clerk/shared/react';
import type { SignInResource, SignUpResource } from '@clerk/shared/types';

export function useCoreSignIn(): SignInResource {
  const client = useClientContext();
  if (!client) {
    throw new Error(
      'Client must be defined before calling useCoreSignIn. This is a bug in Clerk, please report it to support@clerk.com',
    );
  }
  return client.signIn;
}

export function useCoreSignUp(): SignUpResource {
  const client = useClientContext();
  if (!client) {
    throw new Error(
      'Client must be defined before calling useCoreSignUp. This is a bug in Clerk, please report it to support@clerk.com',
    );
  }
  return client.signUp;
}
