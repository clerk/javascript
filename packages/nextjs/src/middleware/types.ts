import type { Session, User } from '@clerk/clerk-sdk-node';
import { ClerkJWTClaims, ServerSideAuth } from '@clerk/types';
import { GetServerSidePropsContext } from 'next';

// TODO: Remove when we're using TS >=4.5
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type WithServerSideAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
  jwtKey?: string;
  authorizedParties?: string[];
};

export type WithServerSideAuthCallback<Return, Options> = (context: ContextWithAuth<Options>) => Return;

export type WithServerSideAuthResult<CallbackReturn> = (
  context: GetServerSidePropsContext,
) => Promise<Awaited<CallbackReturn>>;

export type AuthData = {
  sessionId: string | null;
  session: Session | undefined | null;
  userId: string | null;
  user: User | undefined | null;
  getToken: (...args: any) => Promise<string | null>;
  claims: ClerkJWTClaims | null;
};

export type ContextWithAuth<Options extends WithServerSideAuthOptions = any> = GetServerSidePropsContext & {
  req: RequestWithAuth<Options>;
};

export type RequestWithAuth<Options extends WithServerSideAuthOptions = any> = GetServerSidePropsContext['req'] & {
  auth: ServerSideAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {});
