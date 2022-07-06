import { OrganizationJSON, SessionJSON, UserJSON } from './json';
import { ClerkJWTClaims } from './jwt';
import { SessionResource } from './session';
import { UserResource } from './user';

export type ServerGetTokenOptions = { template?: string };
export type ServerGetToken = (options?: ServerGetTokenOptions) => Promise<string | null>;

export type ServerSideAuth = {
  sessionId: string | null;
  userId: string | null;
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

type SsrOrganizationState<OrganizationType> = { organization: null } | { organization: OrganizationType | undefined };

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
      organization: undefined;
    }
  | (SsrSessionState<SessionJSON> & SsrUserState<UserJSON> & SsrOrganizationState<OrganizationJSON>);
