import { useClerk, useUser } from '@clerk/shared/react';
import type { SignOutOptions } from '@clerk/shared/types';

export type SignOutButtonOptions = Pick<SignOutOptions, 'redirectUrl' | 'sessionId'>;

export type SignOutButtonModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'ready'; onSignOut: () => Promise<unknown> };

export function useSignOutButtonModel({ redirectUrl, sessionId }: SignOutButtonOptions): SignOutButtonModel {
  const clerk = useClerk();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  return { status: 'ready', onSignOut: () => clerk.signOut({ redirectUrl, sessionId }) };
}
