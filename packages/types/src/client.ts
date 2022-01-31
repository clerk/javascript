import { ClerkResource } from './resource';
import { ActiveSessionResource, SessionResource } from './session';
import { SignUpResource } from './signUp';
import { SignInResource } from './signIn';

export interface ClientResource extends ClerkResource {
  sessions: SessionResource[];
  activeSessions: ActiveSessionResource[];
  signUp: SignUpResource;
  signIn: SignInResource;
  isNew: () => boolean;
  create: () => Promise<ClientResource>;
  destroy: () => Promise<void>;
  lastActiveSessionId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
