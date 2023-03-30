import type { AuthenticateRequestOptions, Organization, Session, User } from '@clerk/backend';
import type { ClerkJWTClaims, ServerSideAuth } from '@clerk/types';
import type { GetServerSidePropsContext } from 'next';

/**
 * @deprecated The /middleware path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * @deprecated The /middleware path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export type WithServerSideAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
  /**
   * @deprecated use loadOrganization instead
   */
  loadOrg?: boolean;
  loadOrganization?: boolean;
  jwtKey?: string;
  authorizedParties?: string[];
  audience?: AuthenticateRequestOptions['audience'];
};

/**
 * @deprecated The /middleware path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export type WithServerSideAuthCallback<Return, Options extends WithServerSideAuthOptions> = (
  context: ContextWithAuth<Options>,
) => Return;

/**
 * @deprecated The /middleware path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export type WithServerSideAuthResult<CallbackReturn> = (
  context: GetServerSidePropsContext,
) => Promise<Awaited<CallbackReturn>>;

/**
 * @deprecated The /middleware path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export type AuthData = {
  sessionId: string | null;
  session: Session | undefined | null;
  userId: string | null;
  user: User | undefined | null;
  organization: Organization | undefined | null;
  getToken: (...args: any) => Promise<string | null>;
  claims: ClerkJWTClaims | null;
};

/**
 * @deprecated The /middleware path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export type ContextWithAuth<Options extends WithServerSideAuthOptions = any> = GetServerSidePropsContext & {
  req: RequestWithAuth<Options>;
};

/**
 * @deprecated The /middleware path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export type RequestWithAuth<Options extends WithServerSideAuthOptions = any> = GetServerSidePropsContext['req'] & {
  auth: ServerSideAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {}) &
  (Options extends { loadOrg: true } ? { organization: Organization | null } : {});
