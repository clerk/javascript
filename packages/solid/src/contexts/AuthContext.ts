import type { ActJWTClaim, MembershipRole } from '@clerk/types';
import { createContext, useContext } from 'solid-js';

import { type ContextOf } from '../shared';

export const AuthContext = createContext<
  ContextOf<{
    userId: string | null | undefined;
    sessionId: string | null | undefined;
    actor: ActJWTClaim | null | undefined;
    orgId: string | null | undefined;
    orgRole: MembershipRole | null | undefined;
    orgSlug: string | null | undefined;
  }>
>();

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext not found');
  }
  return () => ctx().value;
};
