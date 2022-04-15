import type { Session, User } from '@clerk/clerk-sdk-node';
import { ServerSideAuth } from '@clerk/types';
import { GetServerDataProps } from 'gatsby';

export type GetServerDataPropsWithAuth<Options extends WithServerAuthOptions = any> = GetServerDataProps & {
  auth: ServerSideAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {});

export type WithServerAuthCallback<Return, Options> = (props: GetServerDataPropsWithAuth<Options>) => Return;

export type WithServerAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
  // TODO: Add support for the following options
  // jwtKey?: string;
  // authorizedParties?: string[];
};
