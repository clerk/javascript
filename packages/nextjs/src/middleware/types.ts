import type { Session, User } from '@clerk/clerk-sdk-node';
import { GetSessionTokenOptions } from '@clerk/types';
import { GetServerSidePropsContext } from 'next';

// TODO: Remove when we're using TS >=4.5
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type WithServerSideAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
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
};

export type ContextWithAuth<Options extends WithServerSideAuthOptions = any> = GetServerSidePropsContext & {
  auth: ServerSideAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {});

export type ServerSideAuth = {
  sessionId: string | null;
  userId: string | null;
  getToken: (options?: GetSessionTokenOptions) => Promise<string | null>;
};
