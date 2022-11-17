import { AuthState, Organization, Session, User } from '@clerk/backend';
import { DataFunctionArgs, LoaderFunction } from '@remix-run/server-runtime';

export type GetAuthReturn = Promise<AuthState>;

export type RootAuthLoaderOptions = {
  frontendApi?: string;
  jwtKey?: string;
  apiKey?: string;
  loadUser?: boolean;
  loadSession?: boolean;
  loadOrganization?: boolean;
  authorizedParties?: [];
};

export type RootAuthLoaderCallback<Options extends RootAuthLoaderOptions> = (
  args: LoaderFunctionArgsWithAuth<Options>,
) => RootAuthLoaderCallbackReturn;

export type RootAuthLoaderCallbackReturn =
  | Promise<Response>
  | Response
  | Promise<Record<string, unknown>>
  | Record<string, unknown>;

export type LoaderFunctionArgs = DataFunctionArgs;
export type LoaderFunctionReturn = ReturnType<LoaderFunction>;

export type LoaderFunctionArgsWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs & {
  request: RequestWithAuth<Options>;
};

export type RequestWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs['request'] & {
  auth: Omit<AuthState, 'session' | 'user' | 'organization'>;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {}) &
  (Options extends { loadOrganization: true } ? { organization: Organization | null } : {});
