import type { SetActive, SignOut } from './clerk';
import type { ActClaim, JwtPayload } from './jwtv2';
import type { OrganizationCustomRoleKey } from './organizationMembership';
import type {
  CheckAuthorizationWithCustomPermissions,
  GetToken,
  SessionResource,
  SignedInSessionResource,
} from './session';
import type { SignInResource } from './signIn';
import type { SignUpResource } from './signUp';
import type { UserResource } from './user';

/**
 * @inline
 */
type CheckAuthorizationWithoutOrgOrUser = (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => false;
/**
 * @inline
 */
type CheckAuthorizationSignedOut = CheckAuthorizationWithoutOrgOrUser;

/**
 * @inline
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
      /**
       * The current user's [session claims](https://clerk.com/docs/guides/sessions/session-tokens).
       */
      sessionClaims: undefined;
      /**
       * The JWT actor for the session. Holds identifier for the user that is impersonating the current user. Read more about [impersonation](https://clerk.com/docs/guides/users/impersonation).
       */
      actor: undefined;
      /**
       * The ID of the user's active Organization.
       */
      orgId: undefined;
      /**
       * The current user's Role in their active Organization.
       */
      orgRole: undefined;
      /**
       * The URL-friendly identifier of the user's Active Organization.
       */
      orgSlug: undefined;
      /**
       * A function that checks if the user has specific Permissions or Roles. See the [reference doc](https://clerk.com/docs/reference/backend/types/auth-object#has).
       */
      has: CheckAuthorizationSignedOut;
      /**
       * A function that signs out the current user. Returns a promise that resolves when complete. See the [reference doc](https://clerk.com/docs/reference/javascript/clerk#sign-out).
       */
      signOut: SignOut;
      /**
       * A function that retrieves the current user's session token or a custom JWT template. Returns a promise that resolves to the token. See the [reference doc](https://clerk.com/docs/reference/javascript/session#get-token).
       *
       * > [!NOTE]
       * > To access auth data server-side, see the [`Auth` object reference doc](https://clerk.com/docs/reference/backend/types/auth-object).
       *
       * @throws {ClerkRuntimeError} When called in a non-browser environment (code: `clerk_runtime_not_browser`)
       */
      getToken: GetToken;
    }
  | {
      isLoaded: true;
      isSignedIn: false;
      userId: null;
      sessionId: null;
      sessionClaims: null;
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
      sessionClaims: JwtPayload;
      actor: ActClaim | null;
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
      sessionClaims: JwtPayload;
      actor: ActClaim | null;
      orgId: string;
      orgRole: OrganizationCustomRoleKey;
      orgSlug: string | null;
      has: CheckAuthorizationWithCustomPermissions;
      signOut: SignOut;
      getToken: GetToken;
    };

/**
 * @inline
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
       * A function that sets the active session. See the [reference doc](https://clerk.com/docs/reference/javascript/clerk#set-active).
       */
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signIn: SignInResource;
      setActive: SetActive;
    };

/**
 * @inline
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
       * A function that sets the active session. See the [reference doc](https://clerk.com/docs/reference/javascript/clerk#set-active).
       */
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signUp: SignUpResource;
      setActive: SetActive;
    };

/**
 * @inline
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
       * The current session for the user.
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
      isSignedIn: boolean;
      session: SignedInSessionResource;
    };

/**
 * @inline
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
       * A function that sets the active session and/or Organization. See the [reference doc](https://clerk.com/docs/reference/javascript/clerk#set-active).
       */
      setActive: undefined;
    }
  | {
      isLoaded: true;
      sessions: SessionResource[];
      setActive: SetActive;
    };

/**
 * @inline
 */
export type UseUserReturn =
  | {
      /**
       * A boolean that indicates whether Clerk has completed initialization. Initially `false`, becomes `true` once Clerk loads.
       */
      isLoaded: false;
      /**
       * A boolean that returns `true` if the user is signed in.
       */
      isSignedIn: undefined;
      /**
       * The `User` object for the current user.
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
