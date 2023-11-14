import type { Autocomplete } from 'utils';

import type { ActJWTClaim } from './jwt';
import type { OrganizationPermission } from './organizationMembership';
import type { ClerkResource } from './resource';
import type { TokenResource } from './token';
import type { UserResource } from './user';

export type experimental__CheckAuthorizationWithoutPermission = (
  isAuthorizedParams: CheckAuthorizationParamsWithoutPermission,
) => boolean;

type CheckAuthorizationParamsWithoutPermission =
  | {
      some: {
        role: string;
      }[];
      role?: never;
    }
  | {
      some?: never;
      role: string;
    };

export type CheckAuthorization = (isAuthorizedParams: CheckAuthorizationParams) => boolean;

type CheckAuthorizationParams =
  | {
      some: (
        | {
            role: string;
            permission?: never;
          }
        | {
            role?: never;
            permission: Autocomplete<OrganizationPermission>;
          }
      )[];
      role?: never;
      permission?: never;
    }
  | {
      some?: never;
      role: string;
      permission?: never;
    }
  | {
      some?: never;
      role?: never;
      permission: Autocomplete<OrganizationPermission>;
    };

export interface SessionResource extends ClerkResource {
  id: string;
  status: SessionStatus;
  expireAt: Date;
  abandonAt: Date;
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
  /**
   * @experimental The method is experimental and subject to change in future releases.
   */
  experimental__checkAuthorization: CheckAuthorization;
  clearCache: () => void;
  createdAt: Date;
  updatedAt: Date;
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

export type GetTokenOptions = { template?: string; leewayInSeconds?: number; skipCache?: boolean };
export type GetToken = (options?: GetTokenOptions) => Promise<string | null>;
