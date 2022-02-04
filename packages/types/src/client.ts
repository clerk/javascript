import { ClerkResource } from './resource';
import { ActiveSessionResource, SessionResource } from './session';
import { SignInResource } from './signIn';
import { SignUpResource } from './signUp';

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
