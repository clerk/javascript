import { ClerkResource } from './resource';
import { TokenResource } from './token';
import { UserResource } from './user';

export interface SessionResource extends ClerkResource {
  id: string;
  status: SessionStatus;
  expireAt: Date;
  abandonAt: Date;
  lastActiveToken: TokenResource | null;
  lastActiveOrganizationId: string | null;
  user: UserResource | null;
  publicUserData: PublicUserData;
  end: () => Promise<SessionResource>;
  remove: () => Promise<SessionResource>;
  touch: () => Promise<SessionResource>;
  getToken: GetToken;
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
  profileImageUrl: string;
  identifier: string;
  userId?: string;
}

export type GetTokenOptions = { template?: string; leewayInSeconds?: number; skipCache?: boolean };
export type GetToken = (options?: GetTokenOptions) => Promise<string | null>;
