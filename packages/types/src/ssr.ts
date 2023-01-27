import type { OrganizationJSON, SessionJSON, UserJSON } from './json';
import type { ActJWTClaim, ClerkJWTClaims } from './jwt';
import type { SessionResource } from './session';
import type { UserResource } from './user';

export type ServerGetTokenOptions = { template?: string };
export type ServerGetToken = (options?: ServerGetTokenOptions) => Promise<string | null>;

/**
 * @deprecated
 */
export type ServerSideAuth = {
  sessionId: string | null;
  userId: string | null;
  actor: ActJWTClaim | null;
  getToken: ServerGetToken;
  claims: ClerkJWTClaims | null;
};

type SsrSessionState<SessionType> =
  | {
      sessionId: null;
      session: null;
    }
  | {
      sessionId: string;
      session: SessionType | undefined;
    };

type SsrOrganizationState<OrganizationType> =
  | { organization: null; organizationId: null }
  | { organization: OrganizationType | undefined; organizationId: string };

type SsrUserState<UserType> =
  | {
      userId: null;
      user: null;
    }
  | {
      userId: string;
      user: UserType | undefined;
    };

export type SsrAuthData = SsrSessionState<SessionResource> & SsrUserState<UserResource>;
export type ClerkSsrState = SsrSessionState<SessionJSON> & SsrUserState<UserJSON>;
export type InitialState =
  | {
      user: undefined;
      userId: undefined;
      session: undefined;
      sessionId: undefined;
      organizationId: undefined;
      organization: undefined;
    }
  | (SsrSessionState<SessionJSON> & SsrUserState<UserJSON> & SsrOrganizationState<OrganizationJSON>);
