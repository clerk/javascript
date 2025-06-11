import type { ClerkResource } from './resource';
import type { ActiveSessionResource, SessionResource, SignedInSessionResource } from './session';
import type { SignInResource } from './signIn';
import type { SignUpResource } from './signUp';
import type { ClientJSONSnapshot } from './snapshots';

export interface ClientResource extends ClerkResource {
  captchaBypass: boolean;
  cookieExpiresAt: Date | null;
  createdAt: Date | null;
  lastActiveSessionId: string | null;
  sessions: SessionResource[];
  signedInSessions: SignedInSessionResource[];
  signIn: SignInResource;
  signUp: SignUpResource;
  updatedAt: Date | null;
  /**
   * @deprecated Use `signedInSessions` instead.
   */
  activeSessions: ActiveSessionResource[];

  buildTouchUrl: (params: { redirectUrl: URL }) => string;
  clearCache: () => void;
  create: () => Promise<ClientResource>;
  destroy: () => Promise<void>;
  isEligibleForTouch: () => boolean;
  isNew: () => boolean;
  removeSessions: () => Promise<ClientResource>;

  __internal_sendCaptchaToken: (params: unknown) => Promise<ClientResource>;
  __internal_toSnapshot: () => ClientJSONSnapshot;

}
