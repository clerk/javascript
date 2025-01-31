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

/**
 * Return values of the `useAuth()` hook
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
      has: CheckAuthorizationSignedOut;
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: false;
      /**
       * The ID of the current user.
       */
      userId: null;
      /**
       * The ID for the current session.
       */
      sessionId: null;
      actor: null;
      /**
       * The ID of the user's active organization.
       */
      orgId: null;
      /**
       * The current user's role in their active organization.
       */
      orgRole: null;
      /**
       * The URL-friendly identifier of the user's active organization.
       */
      orgSlug: null;
      /**
       * A function that checks if the user has specific permissions or roles. See the [reference doc](https://clerk.com/docs/references/backend/types/auth-object#has).
       */
      has: CheckAuthorizationWithoutOrgOrUser;
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: true;
      /**
       * The ID of the current user.
       */
      userId: string;
      /**
       * The ID for the current session.
       */
      sessionId: string;
      actor: ActJWTClaim | null;
      /**
       * The ID of the user's active organization.
       */
      orgId: null;
      /**
       * The current user's role in their active organization.
       */
      orgRole: null;
      /**
       * The URL-friendly identifier of the user's active organization.
       */
      orgSlug: null;
      /**
       * A function that checks if the user has specific permissions or roles. See the [reference doc](https://clerk.com/docs/references/backend/types/auth-object#has).
       */
      has: CheckAuthorizationWithCustomPermissions;
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: true;
      /**
       * The ID of the current user.
       */
      userId: string;
      /**
       * The ID for the current session.
       */
      sessionId: string;
      actor: ActJWTClaim | null;
      /**
       * The ID of the user's active organization.
       */
      orgId: string;
      /**
       * The current user's role in their active organization.
       */
      orgRole: OrganizationCustomRoleKey;
      /**
       * The URL-friendly identifier of the user's active organization.
       */
      orgSlug: string | null;
      /**
       * A function that checks if the user has specific permissions or roles. See the [reference doc](https://clerk.com/docs/references/backend/types/auth-object#has).
       */
      has: CheckAuthorizationWithCustomPermissions;
      /**
       * A function that signs out the current user. Returns a promise that resolves when complete. See the [reference doc](https://clerk.com/docs/references/javascript/clerk/clerk#sign-out).
       */
      signOut: SignOut;
      /**
       * A function that retrieves the current user's session token or a custom JWT template. Returns a promise that resolves to the token. See the [reference doc](https://clerk.com/docs/references/javascript/session#get-token).
       */
      getToken: GetToken;
    };

/**
 * Return values of the `useSignIn()` hook
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * An object that contains the current sign-in attempt status and methods to create a new sign-in attempt.
       */
      signIn: SignInResource;
      /**
       * A function that sets the active session.
       */
      setActive: SetActive;
    };

/**
 * Return values of the `useSignUp()` hook
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * An object that contains the current sign-up attempt status and methods to create a new sign-up attempt.
       */
      signUp: SignUpResource;
      /**
       * A function that sets the active session.
       */
      setActive: SetActive;
    };

/**
 * Return values of the `useSession()` hook
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: false;
      /**
       * Holds the current active session for the user.
       */
      session: null;
    }
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: true;
      /**
       * Holds the current active session for the user.
       */
      session: ActiveSessionResource;
    };

/**
 * Return values of the `useSessionList()` hook
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
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * A list of sessions that have been registered on the client device.
       */
      sessions: SessionResource[];
      /**
       * A function that sets the active session and/or organization.
       */
      setActive: SetActive;
    };

/**
 * Return values of the `useUser()` hook
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
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: false;
      /**
       * The `User` object for the current user. If the user isn't signed in, `user` will be `null`.
       */
      user: null;
    }
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: true;
      /**
       * A boolean that indicates whether a user is currently signed in.
       */
      isSignedIn: true;
      /**
       * The `User` object for the current user. If the user isn't signed in, `user` will be `null`.
       */
      user: UserResource;
    };
