import { Session, User } from '@clerk/backend-core/src';
import { ServerSideAuth } from '@clerk/types';
import { LoaderFunction } from '@remix-run/server-runtime';

export type GetAuthReturn = Promise<ServerSideAuth>;

export type RootAuthLoaderOptions = {
  frontendApi?: string;
  loadUser?: boolean;
  loadSession?: boolean;
};

export type RootAuthLoaderCallback<Options> = (
  args: LoaderFunctionArgsWithAuth<Options>,
) => RootAuthLoaderCallbackReturn;

export type RootAuthLoaderCallbackReturn =
  | Promise<Response>
  | Response
  | Promise<Record<string, unknown>>
  | Record<string, unknown>;

export type LoaderFunctionArgs = Parameters<LoaderFunction>[0];

export type LoaderFunctionReturn = ReturnType<LoaderFunction>;

export type LoaderFunctionArgsWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs & {
  auth: ServerSideAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {});
