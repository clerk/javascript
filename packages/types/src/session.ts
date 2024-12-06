import type { SessionJSON } from 'json';

import type {
  BackupCodeAttempt,
  EmailCodeAttempt,
  EmailCodeConfig,
  PasswordAttempt,
  PhoneCodeAttempt,
  PhoneCodeConfig,
  PhoneCodeSecondFactorConfig,
  TOTPAttempt,
} from './factors';
import type { ActJWTClaim } from './jwt';
import type {
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  OrganizationPermissionKey,
} from './organizationMembership';
import type { ClerkResource } from './resource';
import type {
  ReverificationConfig,
  SessionVerificationLevel,
  SessionVerificationResource,
} from './sessionVerification';
import type { TokenResource } from './token';
import type { UserResource } from './user';

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

export interface SessionResource extends ClerkResource {
  id: string;
  status: SessionStatus;
  expireAt: Date;
  abandonAt: Date;
  /**
   * Factor Verification Age
   * Each item represents the minutes that have passed since the last time a first or second factor were verified.
   * [fistFactorAge, secondFactorAge]
   */
  factorVerificationAge: [number, number] | null;
  lastActiveToken: TokenResource | null;
  lastActiveOrganizationId: string | null;
  lastActiveAt: Date;
  actor: ActJWTClaim | null;
  user: UserResource | null;
  publicUserData: PublicUserData;
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
  toJSON: () => SessionJSON;
}

export interface ActiveSessionResource extends SessionResource {
  status: 'active';
  user: UserResource;
}

export interface SessionWithActivitiesResource extends ClerkResource {
  id: string;
  status: string;
  expireAt: Date;
  abandonAt: Date;
  lastActiveAt: Date;
  latestActivity: SessionActivity;
  actor: ActJWTClaim | null;

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

export type SessionStatus = 'abandoned' | 'active' | 'ended' | 'expired' | 'removed' | 'replaced' | 'revoked';

export interface PublicUserData {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  hasImage: boolean;
  identifier: string;
  userId?: string;
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

export type SessionVerifyPrepareFirstFactorParams = EmailCodeConfig | PhoneCodeConfig;
export type SessionVerifyAttemptFirstFactorParams = EmailCodeAttempt | PhoneCodeAttempt | PasswordAttempt;

export type SessionVerifyPrepareSecondFactorParams = PhoneCodeSecondFactorConfig;
export type SessionVerifyAttemptSecondFactorParams = PhoneCodeAttempt | TOTPAttempt | BackupCodeAttempt;
