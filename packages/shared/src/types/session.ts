import type { ClientResource } from './client';
import type {
  BackupCodeAttempt,
  EmailCodeAttempt,
  EmailCodeConfig,
  EnterpriseSSOConfig,
  PasskeyAttempt,
  PassKeyConfig,
  PasswordAttempt,
  PhoneCodeAttempt,
  PhoneCodeConfig,
  PhoneCodeSecondFactorConfig,
  TOTPAttempt,
} from './factors';
import type { ActClaim, AgentActClaim } from './jwtv2';
import type {
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  OrganizationPermissionKey,
  OrganizationSystemPermissionPrefix,
} from './organizationMembership';
import type { ClerkResource } from './resource';
import type {
  ReverificationConfig,
  SessionVerificationLevel,
  SessionVerificationResource,
} from './sessionVerification';
import type { SessionJSONSnapshot } from './snapshots';
import type { TokenResource } from './token';
import type { UserResource } from './user';
import type { Autocomplete } from './utils';

/**
 * @inline
 */
export type PendingSessionOptions = {
  /**
   * A boolean that indicates whether pending sessions are considered as signed out or not.
   *
   * @default true
   */
  treatPendingAsSignedOut?: boolean;
};

type DisallowSystemPermissions<P extends string> = P extends `${OrganizationSystemPermissionPrefix}${string}`
  ? 'System permissions are not included in session claims and cannot be used on the server-side'
  : P;

/** @inline */
export type CheckAuthorizationFn<Params> = (isAuthorizedParams: Params) => boolean;

/** @inline */
export type CheckAuthorizationWithCustomPermissions =
  CheckAuthorizationFn<CheckAuthorizationParamsWithCustomPermissions>;

type WithReverification<T> = T & {
  /**
   * The reverification configuration to check for. This feature is currently in public beta. **It is not recommended for production use.**
   */
  reverification?: ReverificationConfig;
};

export type CheckAuthorizationParamsWithCustomPermissions = WithReverification<
  | {
      /**
       * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to check for.
       */
      role: OrganizationCustomRoleKey;
      /**
       * The [Permission](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to check for.
       */
      permission?: never;
      /**
       * The [Feature](https://clerk.com/docs/guides/billing/overview) to check for.
       */
      feature?: never;
      /**
       * The [Plan](https://clerk.com/docs/guides/billing/overview) to check for.
       */
      plan?: never;
    }
  | {
      role?: never;
      permission: OrganizationCustomPermissionKey;
      feature?: never;
      plan?: never;
    }
  | {
      role?: never;
      permission?: never;
      feature: Autocomplete<`user:${string}` | `org:${string}`>;
      plan?: never;
    }
  | {
      role?: never;
      permission?: never;
      feature?: never;
      plan: Autocomplete<`user:${string}` | `org:${string}`>;
    }
  | { role?: never; permission?: never; feature?: never; plan?: never }
>;

export type CheckAuthorization = CheckAuthorizationFn<CheckAuthorizationParams>;

type CheckAuthorizationParams = WithReverification<
  | {
      /**
       * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to check for.
       */
      role: OrganizationCustomRoleKey;
      /**
       * The [Permission](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to check for.
       */
      permission?: never;
      /**
       * The [Feature](https://clerk.com/docs/guides/billing/overview) to check for.
       */
      feature?: never;
      /**
       * The [Plan](https://clerk.com/docs/guides/billing/overview) to check for.
       */
      plan?: never;
    }
  | {
      role?: never;
      permission: OrganizationPermissionKey;
      feature?: never;
      plan?: never;
    }
  | {
      role?: never;
      permission?: never;
      feature: Autocomplete<`user:${string}` | `org:${string}`>;
      plan?: never;
    }
  | {
      role?: never;
      permission?: never;
      feature?: never;
      plan: Autocomplete<`user:${string}` | `org:${string}`>;
    }
  | { role?: never; permission?: never; feature?: never; plan?: never }
>;

/**
 * Type guard for server-side authorization checks using session claims.
 * System Permissions are not allowed since they are not included
 * in session claims and cannot be verified on the server side.
 */
export type CheckAuthorizationFromSessionClaims = <P extends OrganizationCustomPermissionKey>(
  isAuthorizedParams: CheckAuthorizationParamsFromSessionClaims<P>,
) => boolean;

/**
 * @interface
 */
export type CheckAuthorizationParamsFromSessionClaims<P extends OrganizationCustomPermissionKey> = WithReverification<
  | {
      /**
       * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to check for.
       */
      role: OrganizationCustomRoleKey;
      /**
       * The [Permission](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to check for.
       */
      permission?: never;
      /**
       * The [Feature](https://clerk.com/docs/guides/billing/overview) to check for.
       */
      feature?: never;
      /**
       * The [Plan](https://clerk.com/docs/guides/billing/overview) to check for.
       */
      plan?: never;
    }
  | {
      role?: never;
      permission: DisallowSystemPermissions<P>;
      feature?: never;
      plan?: never;
    }
  | {
      role?: never;
      permission?: never;
      feature: Autocomplete<`user:${string}` | `org:${string}`>;
      plan?: never;
    }
  | {
      role?: never;
      permission?: never;
      feature?: never;
      plan: Autocomplete<`user:${string}` | `org:${string}`>;
    }
  | { role?: never; permission?: never; feature?: never; plan?: never }
>;

/**
 * The `Session` object is an abstraction over an HTTP session. It models the period of information exchange between a user and the server.
 *
 * The `Session` object includes methods for recording session activity and ending the session client-side. For security reasons, sessions can also expire server-side.
 *
 * As soon as a [`User`](https://clerk.com/docs/reference/objects/user) signs in, Clerk creates a `Session` for the current [`Client`](https://clerk.com/docs/reference/objects/client). Clients can have more than one sessions at any point in time, but only one of those sessions will be **active**.
 *
 * In certain scenarios, a session might be replaced by another one. This is often the case with [multi-session applications](https://clerk.com/docs/guides/secure/session-options#multi-session-applications).
 *
 * All sessions that are **expired**, **removed**, **replaced**, **ended** or **abandoned** are not considered valid.
 *
 * > [!NOTE]
 * > For more information regarding the different session states, see the [guide on session management](https://clerk.com/docs/guides/secure/session-options).
 */
export interface SessionResource extends ClerkResource {
  /**
   * The unique identifier for the session.
   */
  id: string;
  /**
   * The current state of the session.
   */
  status: SessionStatus;
  /**
   * The date and time when the session will expire.
   */
  expireAt: Date;
  /**
   * The date and time when the session was abandoned by the user.
   */
  abandonAt: Date;
  /**
   * An array where each item represents the number of minutes since the last verification of a first or second factor: `[firstFactorAge, secondFactorAge]`.
   */
  factorVerificationAge: [firstFactorAge: number, secondFactorAge: number] | null;
  /**
   * The token that was last used to authenticate the session.
   */
  lastActiveToken: TokenResource | null;
  /**
   * The ID of the last [Active Organization](!active-organization).
   */
  lastActiveOrganizationId: string | null;
  /**
   * The date and time when the session was last active on the [`Client`](https://clerk.com/docs/reference/objects/client).
   */
  lastActiveAt: Date;
  /**
   * The JWT actor for the session. Holds identifier for the user that is impersonating the current user. Read more about [impersonation](https://clerk.com/docs/guides/users/impersonation).
   */
  actor: ActClaim | null;
  /**
   * When the session's actor claim has `type: 'agent'`, this property exposes information about the agent and [Agent Task](https://clerk.com/docs/reference/objects/agent-task) that was used to create the session.
   */
  agent: AgentActClaim | null;
  /**
   * The user's pending [session tasks](https://clerk.com/docs/guides/configure/session-tasks).
   */
  tasks: Array<SessionTask> | null;
  /**
   * The user's current pending [session task](https://clerk.com/docs/guides/configure/session-tasks).
   */
  currentTask?: SessionTask;
  /**
   * The [`User`](https://clerk.com/docs/reference/objects/user) associated with the session.
   */
  user: UserResource | null;
  /**
   * Publicly available information about the current [`User`](https://clerk.com/docs/reference/objects/user).
   */
  publicUserData: PublicUserData;
  /**
   * Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
   */
  end: () => Promise<SessionResource>;
  remove: () => Promise<SessionResource>;
  touch: (params?: SessionTouchParams) => Promise<SessionResource>;
  getToken: GetToken;
  checkAuthorization: CheckAuthorization;
  clearCache: () => void;
  /**
   * The date and time when the session was first created.
   */
  createdAt: Date;
  /**
   * The date and time when the session was last updated.
   */
  updatedAt: Date;

  startVerification: (params: SessionVerifyCreateParams) => Promise<SessionVerificationResource>;
  prepareFirstFactorVerification: (
    factor: SessionVerifyPrepareFirstFactorParams,
  ) => Promise<SessionVerificationResource>;
  attemptFirstFactorVerification: (
    attemptFactor: SessionVerifyAttemptFirstFactorParams,
  ) => Promise<SessionVerificationResource>;
  prepareSecondFactorVerification: (
    params: SessionVerifyPrepareSecondFactorParams,
  ) => Promise<SessionVerificationResource>;
  attemptSecondFactorVerification: (
    params: SessionVerifyAttemptSecondFactorParams,
  ) => Promise<SessionVerificationResource>;
  verifyWithPasskey: () => Promise<SessionVerificationResource>;
  __internal_toSnapshot: () => SessionJSONSnapshot;
  __internal_touch: (params?: SessionTouchParams) => Promise<ClientResource | undefined>;
}

/**
 * Represents a session resource that has completed all pending tasks
 * and authentication factors
 */
export interface ActiveSessionResource extends SessionResource {
  status: 'active';
  user: UserResource;
}

/**
 * Represents a session resource that has completed sign-in but has pending tasks
 */
export interface PendingSessionResource extends SessionResource {
  status: 'pending';
  user: UserResource;
  currentTask: SessionTask;
}

/**
 * Represents session resources for users who have completed
 * the full sign-in flow
 */
export type SignedInSessionResource = ActiveSessionResource | PendingSessionResource;

export interface SessionWithActivitiesResource extends ClerkResource {
  id: string;
  status: string;
  expireAt: Date;
  abandonAt: Date;
  lastActiveAt: Date;
  latestActivity: SessionActivity;
  actor: ActClaim | null;

  revoke: () => Promise<SessionWithActivitiesResource>;
}

export interface SessionActivity {
  id: string;
  browserName?: string;
  browserVersion?: string;
  deviceType?: string;
  ipAddress?: string;
  city?: string;
  country?: string;
  isMobile?: boolean;
}

/**
 * The current state of the session.
 */
export type SessionStatus =
  /**
   * The session was abandoned client-side.
   */
  | 'abandoned'
  /**
   * The session is valid and all activity is allowed.
   */
  | 'active'
  /**
   * The user signed out of the session, but the [`Session`](https://clerk.com/docs/reference/objects/session) remains in the [`Client`](https://clerk.com/docs/reference/objects/client).
   */
  | 'ended'
  /**
   * The period of allowed activity for this session has passed.
   */
  | 'expired'
  /**
   * The user signed out of the session and the [`Session`](https://clerk.com/docs/reference/objects/session) was removed from the [`Client`](https://clerk.com/docs/reference/objects/client).
   */
  | 'removed'
  /**
   * The session has been replaced by another one, but the previous [`Session`](https://clerk.com/docs/reference/objects/session) remains in the [`Client`](https://clerk.com/docs/reference/objects/client).
   */
  | 'replaced'
  /**
   * The application ended the session and the [`Session`](https://clerk.com/docs/reference/objects/session) was removed from the [`Client`](https://clerk.com/docs/reference/objects/client).
   */
  | 'revoked'
  /**
   * The user has signed in but hasn't completed [session tasks](https://clerk.com/docs/guides/configure/session-tasks).
   */
  | 'pending';

export type SessionTouchIntent = 'focus' | 'select_session' | 'select_org';

export type SessionTouchParams = {
  intent?: SessionTouchIntent;
};

/**
 * Information about the user that's publicly available.
 */
export interface PublicUserData {
  /**
   * The user's first name.
   */
  firstName: string | null;
  /**
   * The user's last name.
   */
  lastName: string | null;
  /**
   * Holds the default avatar or user's uploaded profile image. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/development/image-optimization).
   */
  imageUrl: string;
  /**
   * Indicates whether the user has a profile picture.
   */
  hasImage: boolean;
  /**
   * The user's identifier, such as their email address or phone number. Can be used for user identification.
   */
  identifier: string;
  /**
   * The user's unique identifier.
   */
  userId?: string;
  /**
   * The user's username.
   */
  username?: string;
  /**
   * Indicates whether the user is banned.
   */
  banned?: boolean;
}

/**
 * Represents the current pending task of a session.
 */
export interface SessionTask {
  /**
   * A unique identifier for the task
   */
  key: 'choose-organization' | 'reset-password' | 'setup-mfa';
}

export type GetTokenOptions = {
  organizationId?: string;
  skipCache?: boolean;
  template?: string;
};
/**
 * @inline
 */
export type GetToken = (options?: GetTokenOptions) => Promise<string | null>;

export type SessionVerifyCreateParams = {
  level: SessionVerificationLevel;
};

export type SessionVerifyPrepareFirstFactorParams =
  | EmailCodeConfig
  | PhoneCodeConfig
  | PassKeyConfig
  /**
   * @experimental
   */
  | Omit<EnterpriseSSOConfig, 'actionCompleteRedirectUrl'>;
export type SessionVerifyAttemptFirstFactorParams =
  | EmailCodeAttempt
  | PhoneCodeAttempt
  | PasswordAttempt
  | PasskeyAttempt;

export type SessionVerifyPrepareSecondFactorParams = PhoneCodeSecondFactorConfig;
export type SessionVerifyAttemptSecondFactorParams = PhoneCodeAttempt | TOTPAttempt | BackupCodeAttempt;
