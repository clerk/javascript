import type { Session, User } from '@clerk/clerk-sdk-node';
import type { ServerSideAuth } from '@clerk/types';
import type { GetServerDataProps } from 'gatsby';

export type WithServerAuthResult<CallbackReturn> = (props: GetServerDataProps) => Promise<Awaited<CallbackReturn>>;

export type GetServerDataPropsWithAuth<Options extends WithServerAuthOptions = any> = GetServerDataProps & {
  auth: ServerSideAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {});

export type WithServerAuthCallback<Return, Options extends WithServerAuthOptions> = (
  props: GetServerDataPropsWithAuth<Options>,
) => Return;

export type WithServerAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
  // TODO: Add support for the following options
  // jwtKey?: string;
  // authorizedParties?: string[];
};
