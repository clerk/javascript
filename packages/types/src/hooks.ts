import type { OrganizationCustomRoleKey } from 'organizationMembership';
import type { SignInResource } from 'signIn';

import type { SetActive, SignOut } from './clerk';
import type { ActJWTClaim } from './jwt';
import type {
  ActiveSessionResource,
  CheckAuthorizationWithCustomPermissions,
  GetToken,
  SessionResource,
} from './session';
import type { SignUpResource } from './signUp';
import type { UserResource } from './user';

type CheckAuthorizationSignedOut = undefined;
type CheckAuthorizationWithoutOrgOrUser = (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => false;

export type UseAuthReturn =
  | {
      isLoaded: false;
      isSignedIn: undefined;
      userId: undefined;
      sessionId: undefined;
      actor: undefined;
      orgId: undefined;
      orgRole: undefined;
      orgSlug: undefined;
      has: CheckAuthorizationSignedOut;
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
      has: CheckAuthorizationWithoutOrgOrUser;
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
      has: CheckAuthorizationWithCustomPermissions;
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
      orgRole: OrganizationCustomRoleKey;
      orgSlug: string | null;
      has: CheckAuthorizationWithCustomPermissions;
      signOut: SignOut;
      getToken: GetToken;
    };

export type UseSignInReturn =
  | {
      isLoaded: false;
      signIn: undefined;
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signIn: SignInResource;
      setActive: SetActive;
    };

export type UseSignUpReturn =
  | {
      isLoaded: false;
      signUp: undefined;
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signUp: SignUpResource;
      setActive: SetActive;
    };

export type UseSessionReturn =
  | { isLoaded: false; isSignedIn: undefined; session: undefined }
  | { isLoaded: true; isSignedIn: false; session: null }
  | { isLoaded: true; isSignedIn: true; session: ActiveSessionResource };

export type UseSessionListReturn =
  | {
      isLoaded: false;
      sessions: undefined;
      setActive: undefined;
    }
  | {
      isLoaded: true;
      sessions: SessionResource[];
      setActive: SetActive;
    };

export type UseUserReturn =
  | { isLoaded: false; isSignedIn: undefined; user: undefined }
  | { isLoaded: true; isSignedIn: false; user: null }
  | { isLoaded: true; isSignedIn: true; user: UserResource };
