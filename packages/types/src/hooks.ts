import type { OrganizationCustomRoleKey } from 'organizationMembership';
import type { SignInResource } from 'signIn';

import type { SetActive, SignOut } from './clerk';
import type { ActJWTClaim } from './jwt';
import type {
  CheckAuthorizationWithCustomPermissions,
  GetToken,
  SessionResource,
  SignedInSessionResource,
} from './session';
import type { SignUpResource } from './signUp';
import type { UserResource } from './user';

type CheckAuthorizationWithoutUser = (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => false;

/**
 * Return values of the `useAuth()` hook
 * @interface
 */
export type UseAuthReturn =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: undefined;
      /**
       * The ID of the current user.
       */
      userId: undefined;
      /**
       * The ID for the current session.
       */
      sessionId: undefined;
      actor: undefined;
      /**
       * The ID of the user's active organization.
       */
      orgId: undefined;
      /**
       * The current user's role in their active organization.
       */
      orgRole: undefined;
      /**
       * The URL-friendly identifier of the user's active organization.
       */
      orgSlug: undefined;
      /**
       * A function that checks if the user has specific permissions or roles. See the [reference doc](https://clerk.com/docs/references/backend/types/auth-object#has).
       */
      has: CheckAuthorizationWithoutUser;
      /**
       * A function that signs out the current user. Returns a promise that resolves when complete. See the [reference doc](https://clerk.com/docs/references/javascript/clerk/clerk#sign-out).
       */
      signOut: SignOut;
      /**
       * A function that retrieves the current user's session token or a custom JWT template. Returns a promise that resolves to the token. See the [reference doc](https://clerk.com/docs/references/javascript/session#get-token).
       */
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
      has: CheckAuthorizationWithoutUser;
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

/**
 * Return values of the `useSignIn()` hook
 * @interface
 */
export type UseSignInReturn =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * An object that contains the current sign-in attempt status and methods to create a new sign-in attempt.
       */
      signIn: undefined;
      /**
       * A function that sets the active session.
       */
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signIn: SignInResource;
      setActive: SetActive;
    };

/**
 * Return values of the `useSignUp()` hook
 * @interface
 */
export type UseSignUpReturn =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * An object that contains the current sign-up attempt status and methods to create a new sign-up attempt.
       */
      signUp: undefined;
      /**
       * A function that sets the active session.
       */
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signUp: SignUpResource;
      setActive: SetActive;
    };

/**
 * Return values of the `useSession()` hook
 * @interface
 */
export type UseSessionReturn =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: undefined;
      /**
       * Holds the current active session for the user.
       */
      session: undefined;
    }
  | {
      isLoaded: true;
      isSignedIn: false;
      session: null;
    }
  | {
      isLoaded: true;
      isSignedIn: true;
      session: SignedInSessionResource;
    };

/**
 * Return values of the `useSessionList()` hook
 * @interface
 */
export type UseSessionListReturn =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * A list of sessions that have been registered on the client device.
       */
      sessions: undefined;
      /**
       * A function that sets the active session and/or organization.
       */
      setActive: undefined;
    }
  | {
      isLoaded: true;
      sessions: SessionResource[];
      setActive: SetActive;
    };

/**
 * Return values of the `useUser()` hook
 * @interface
 */
export type UseUserReturn =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: undefined;
      /**
       * The `User` object for the current user. If the user isn't signed in, `user` will be `null`.
       */
      user: undefined;
    }
  | {
      isLoaded: true;
      isSignedIn: false;
      user: null;
    }
  | {
      isLoaded: true;
      isSignedIn: true;
      user: UserResource;
    };
