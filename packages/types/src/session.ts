import { ClerkResource } from './resource';
import { GetSessionTokenOptions, TokenResource } from './token';
import { UserResource } from './user';

export interface SessionResource extends ClerkResource {
  id: string;
  status: SessionStatus;
  expireAt: Date;
  abandonAt: Date;
  lastActiveToken: TokenResource | null;
  user: UserResource | null;
  publicUserData: PublicUserData;
  end: () => Promise<SessionResource>;
  remove: () => Promise<SessionResource>;
  /**
   *  `revoke` has been deprecated and will be removed soon.
   */
  revoke: () => Promise<SessionResource>;
  touch: () => Promise<SessionResource>;
  getToken: (options?: GetSessionTokenOptions) => Promise<string>;
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

export type SessionStatus =
  | 'abandoned'
  | 'active'
  | 'ended'
  | 'expired'
  | 'removed'
  | 'replaced'
  | 'revoked';

export interface PublicUserData {
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string;
  identifier: string;
}
