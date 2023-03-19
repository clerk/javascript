import { invalidStateError } from '@clerk/clerk-react/dist/errors';
import { createGetToken, createSignOut } from '@clerk/clerk-react/dist/hooks/utils';
import type { ActJWTClaim, GetToken, MembershipRole, SignOut } from '@clerk/types';
import { useClerkProvide } from 'src/injection';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

type UseAuthReturn =
  | {
      isLoaded: false;
      isSignedIn: undefined;
      userId: undefined;
      sessionId: undefined;
      actor: undefined;
      orgId: undefined;
      orgRole: undefined;
      orgSlug: undefined;
      signOut: SignOut;
      getToken: GetToken;
    }
  | {
      isLoaded: true;
      isSignedIn: false;
      userId: null;
      sessionId: null;
      actor: null;
      orgId: null;
      orgRole: null;
      orgSlug: null;
      signOut: SignOut;
      getToken: GetToken;
    }
  | {
      isLoaded: true;
      isSignedIn: true;
      userId: string;
      sessionId: string;
      actor: ActJWTClaim | null;
      orgId: null;
      orgRole: null;
      orgSlug: null;
      signOut: SignOut;
      getToken: GetToken;
    }
  | {
      isLoaded: true;
      isSignedIn: true;
      userId: string;
      sessionId: string;
      actor: ActJWTClaim | null;
      orgId: string;
      orgRole: MembershipRole;
      orgSlug: string | null;
      signOut: SignOut;
      getToken: GetToken;
    };

export function useAuth(): ComputedRef<UseAuthReturn> {
  const { clerk, derivedState } = useClerkProvide();

  const getToken: GetToken = createGetToken(clerk);
  const signOut: SignOut = createSignOut(clerk);

  return computed(() => {
    const { sessionId, userId, actor, orgId, orgRole, orgSlug } = derivedState.value;

    if (sessionId === undefined && userId === undefined) {
      return {
        isLoaded: false,
        isSignedIn: undefined,
        sessionId,
        userId,
        actor: undefined,
        orgId: undefined,
        orgRole: undefined,
        orgSlug: undefined,
        signOut,
        getToken,
      };
    }

    if (sessionId === null && userId === null) {
      return {
        isLoaded: true,
        isSignedIn: false,
        sessionId,
        userId,
        actor: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        signOut,
        getToken,
      };
    }

    if (!!sessionId && !!userId && !!orgId && !!orgRole) {
      return {
        isLoaded: true,
        isSignedIn: true,
        sessionId,
        userId,
        actor: actor || null,
        orgId,
        orgRole,
        orgSlug: orgSlug || null,
        signOut,
        getToken,
      };
    }

    if (!!sessionId && !!userId && !orgId) {
      return {
        isLoaded: true,
        isSignedIn: true,
        sessionId,
        userId,
        actor: actor || null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        signOut,
        getToken,
      };
    }

    throw new Error(invalidStateError);
  });
}
