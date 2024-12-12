import type { ClientJSONSnapshot } from 'snapshots';

import type { ClerkResource } from './resource';
import type { ActiveSessionResource, SessionResource } from './session';
import type { SignInResource } from './signIn';
import type { SignUpResource } from './signUp';

export interface ClientResource extends ClerkResource {
  sessions: SessionResource[];
  activeSessions: ActiveSessionResource[];
  signUp: SignUpResource;
  signIn: SignInResource;
  isNew: () => boolean;
  create: () => Promise<ClientResource>;
  sendCaptchaToken: (params: unknown) => Promise<ClientResource>;
  destroy: () => Promise<void>;
  removeSessions: () => Promise<ClientResource>;
  clearCache: () => void;
  isEligibleForTouch: () => boolean;
  buildTouchUrl: (params: { redirectUrl: URL }) => string;
  lastActiveSessionId: string | null;
  cookieExpiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  toJSON: () => ClientJSONSnapshot;
}
