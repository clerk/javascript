import type { EnvironmentResource, LoadedClerk } from '@clerk/types';
import type { SnapshotFrom } from 'xstate';

import type { SignInMachine } from './sign-in.machine';

export type FieldDetails = {
  type?: string;
  value?: string | readonly string[] | number;
  error?: Error;
};

export type WithClerk<T> = { clerk: LoadedClerkWithEnv } & T;
export type WithClient<T> = { client: LoadedClerkWithEnv['client'] } & T;
export type WithParams<T> = { params: T };

export interface LoadedClerkWithEnv extends LoadedClerk {
  __unstable__environment: EnvironmentResource;
}

export type SnapshotState = SnapshotFrom<typeof SignInMachine>;
