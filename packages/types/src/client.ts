import type { ClerkResource } from './resource';
import type { ActiveSessionResource, SessionResource, SignedInSessionResource } from './session';
import type { SignInResource } from './signIn';
import type { SignUpResource } from './signUp';
import type { ClientJSONSnapshot } from './snapshots';

export interface ClientResource extends ClerkResource {
  sessions: SessionResource[];
  signedInSessions: SignedInSessionResource[];
  signUp: SignUpResource;
  signIn: SignInResource;
  isNew: () => boolean;
  create: () => Promise<ClientResource>;
  destroy: () => Promise<void>;
  removeSessions: () => Promise<ClientResource>;
  clearCache: () => void;
  isEligibleForTouch: () => boolean;
  buildTouchUrl: (params: { redirectUrl: URL }) => string;
  lastActiveSessionId: string | null;
  captchaBypass: boolean;
  cookieExpiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  __internal_sendCaptchaToken: (params: unknown) => Promise<ClientResource>;
  __internal_toSnapshot: () => ClientJSONSnapshot;
  /**
   * @deprecated Use `signedInSessions` instead
   */
  activeSessions: ActiveSessionResource[];
}
