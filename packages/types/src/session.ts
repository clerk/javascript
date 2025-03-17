import type {
  BackupCodeAttempt,
  EmailCodeAttempt,
  EmailCodeConfig,
  PasskeyAttempt,
  PassKeyConfig,
  PasswordAttempt,
  PhoneCodeAttempt,
  PhoneCodeConfig,
  PhoneCodeSecondFactorConfig,
  TOTPAttempt,
} from './factors';
import type { ActClaim } from './jwtv2';
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

type DisallowSystemPermissions<P extends string> = P extends `${OrganizationSystemPermissionPrefix}${string}`
  ? 'System permissions are not included in session claims and cannot be used on the server-side'
  : P;

export type CheckAuthorizationFn<Params> = (isAuthorizedParams: Params) => boolean;

export type CheckAuthorizationWithCustomPermissions =
  CheckAuthorizationFn<CheckAuthorizationParamsWithCustomPermissions>;

type WithReverification<T> = T & {
  reverification?: ReverificationConfig;
};

export type CheckAuthorizationParamsWithCustomPermissions = WithReverification<
  | {
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      role?: never;
      permission: OrganizationCustomPermissionKey;
    }
  | { role?: never; permission?: never }
>;

export type CheckAuthorization = CheckAuthorizationFn<CheckAuthorizationParams>;

type CheckAuthorizationParams = WithReverification<
  | {
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      role?: never;
      permission: OrganizationPermissionKey;
    }
  | {
      role?: never;
      permission?: never;
    }
>;

/**
 * Type guard for server-side authorization checks using session claims.
 * System permissions are not allowed since they are not included
 * in session claims and cannot be verified on the server side.
 */
export type CheckAuthorizationFromSessionClaims = <P extends OrganizationCustomPermissionKey>(
  isAuthorizedParams: CheckAuthorizationParamsFromSessionClaims<P>,
) => boolean;

export type CheckAuthorizationParamsFromSessionClaims<P extends OrganizationCustomPermissionKey> = WithReverification<
  | {
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      role?: never;
      permission: DisallowSystemPermissions<P>;
    }
  | { role?: never; permission?: never }
>;

/**
 * The `Session` object is an abstraction over an HTTP session. It models the period of information exchange between a user and the server.
 *
 * The `Session` object includes methods for recording session activity and ending the session client-side. For security reasons, sessions can also expire server-side.
 *
 * As soon as a [`User`](https://clerk.com/docs/references/javascript/user) signs in, Clerk creates a `Session` for the current [`Client`](https://clerk.com/docs/references/javascript/client). Clients can have more than one sessions at any point in time, but only one of those sessions will be **active**.
 *
 * In certain scenarios, a session might be replaced by another one. This is often the case with [multi-session applications](https://clerk.com/docs/authentication/configuration/session-options#multi-session-applications).
 *
 * All sessions that are **expired**, **removed**, **replaced**, **ended** or **abandoned** are not considered valid.
 *
 * > [!NOTE]
 * > For more information regarding the different session states, see the [guide on session management](https://clerk.com/docs/authentication/configuration/session-options).
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
  expireAt: Date;
  abandonAt: Date;
  /**
   * An array where each item represents the number of minutes since the last verification of a first or second factor: `[firstFactorAge, secondFactorAge]`.
   */
  factorVerificationAge: [firstFactorAge: number, secondFactorAge: number] | null;
  lastActiveToken: TokenResource | null;
  lastActiveOrganizationId: string | null;
  lastActiveAt: Date;
  actor: ActClaim | null;
  tasks: Array<SessionTask> | null;
  currentTask?: SessionTask;
  /**
   * The user associated with the session.
   */
  user: UserResource | null;
  publicUserData: PublicUserData;
  /**
   * Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
   */
  end: () => Promise<SessionResource>;
  remove: () => Promise<SessionResource>;
  touch: () => Promise<SessionResource>;
  getToken: GetToken;
  checkAuthorization: CheckAuthorization;
  clearCache: () => void;
  createdAt: Date;
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

export type SessionStatus =
  | 'abandoned'
  | 'active'
  | 'ended'
  | 'expired'
  | 'removed'
  | 'replaced'
  | 'revoked'
  | 'pending';

export interface PublicUserData {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  hasImage: boolean;
  identifier: string;
  userId?: string;
}

export interface SessionTask {
  key: 'org';
}

export type GetTokenOptions = {
  template?: string;
  organizationId?: string;
  leewayInSeconds?: number;
  skipCache?: boolean;
};
export type GetToken = (options?: GetTokenOptions) => Promise<string | null>;

export type SessionVerifyCreateParams = {
  level: SessionVerificationLevel;
};

export type SessionVerifyPrepareFirstFactorParams = EmailCodeConfig | PhoneCodeConfig | PassKeyConfig;
export type SessionVerifyAttemptFirstFactorParams =
  | EmailCodeAttempt
  | PhoneCodeAttempt
  | PasswordAttempt
  | PasskeyAttempt;

export type SessionVerifyPrepareSecondFactorParams = PhoneCodeSecondFactorConfig;
export type SessionVerifyAttemptSecondFactorParams = PhoneCodeAttempt | TOTPAttempt | BackupCodeAttempt;
