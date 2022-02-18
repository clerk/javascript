import { Session, User } from '@clerk/backend-core/src';
import { ServerSideAuth } from '@clerk/types';
import { LoaderFunction } from 'remix';

export type InferLoaderData<U = any> = {
  data: U;
  clerkState: { __type: 'clerkState' };
};

export type GetAuthReturn<Options> = Promise<
  ServerSideAuth &
    (Options extends { loadSession: true } ? { session: Session | null } : {}) &
    (Options extends { loadUser: true } ? { user: User | null } : {})
>;

export type GetAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
};

export type RootAuthLoaderOptions = GetAuthOptions;

export type RootAuthLoaderCallback<Options> = (args: LoaderFunctionArgsWithAuth<Options>) => LoaderFunctionReturn;

export type LoaderFunctionArgs = Parameters<LoaderFunction>[0];
export type LoaderFunctionReturn = ReturnType<LoaderFunction>;
export type LoaderFunctionArgsWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs & {
  auth: ServerSideAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {});
