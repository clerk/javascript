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
  __experimental_ReverificationConfig,
  __experimental_SessionVerificationLevel,
  __experimental_SessionVerificationResource,
} from './sessionVerification';
import type { TokenResource } from './token';
import type { UserResource } from './user';

export type CheckAuthorizationFn<Params> = (isAuthorizedParams: Params) => boolean;

export type CheckAuthorizationWithCustomPermissions =
  CheckAuthorizationFn<CheckAuthorizationParamsWithCustomPermissions>;

export type CheckAuthorizationParamsWithCustomPermissions = (
  | {
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      role?: never;
      permission: OrganizationCustomPermissionKey;
    }
  | { role?: never; permission?: never }
) & {
  __experimental_reverification?: __experimental_ReverificationConfig;
};

export type CheckAuthorization = CheckAuthorizationFn<CheckAuthorizationParams>;

type CheckAuthorizationParams = (
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
) & {
  __experimental_reverification?: __experimental_ReverificationConfig;
};

export interface SessionResource extends ClerkResource {
  id: string;
  status: SessionStatus;
  expireAt: Date;
  abandonAt: Date;
  /**
   * Factor Verification Age
   * Each item represents the minutes that have passed since the last time a first or second factor were verified.
   * [fistFactorAge, secondFactorAge]
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_factorVerificationAge: [number, number] | null;
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

  __experimental_startVerification: (
    params: __experimental_SessionVerifyCreateParams,
  ) => Promise<__experimental_SessionVerificationResource>;
  __experimental_prepareFirstFactorVerification: (
    factor: __experimental_SessionVerifyPrepareFirstFactorParams,
  ) => Promise<__experimental_SessionVerificationResource>;
  __experimental_attemptFirstFactorVerification: (
    attemptFactor: __experimental_SessionVerifyAttemptFirstFactorParams,
  ) => Promise<__experimental_SessionVerificationResource>;
  __experimental_prepareSecondFactorVerification: (
    params: __experimental_SessionVerifyPrepareSecondFactorParams,
  ) => Promise<__experimental_SessionVerificationResource>;
  __experimental_attemptSecondFactorVerification: (
    params: __experimental_SessionVerifyAttemptSecondFactorParams,
  ) => Promise<__experimental_SessionVerificationResource>;
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

export type __experimental_SessionVerifyCreateParams = {
  level: __experimental_SessionVerificationLevel;
};

export type __experimental_SessionVerifyPrepareFirstFactorParams = EmailCodeConfig | PhoneCodeConfig;
export type __experimental_SessionVerifyAttemptFirstFactorParams =
  | EmailCodeAttempt
  | PhoneCodeAttempt
  | PasswordAttempt;

export type __experimental_SessionVerifyPrepareSecondFactorParams = PhoneCodeSecondFactorConfig;
export type __experimental_SessionVerifyAttemptSecondFactorParams = PhoneCodeAttempt | TOTPAttempt | BackupCodeAttempt;
