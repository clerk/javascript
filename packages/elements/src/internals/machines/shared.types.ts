import type { LoadedClerk } from '@clerk/types';

export type WithClerk<T = Record<string, unknown>> = { clerk: LoadedClerk } & T;
export type WithClient<T = Record<string, unknown>> = { client: LoadedClerk['client'] } & T;
export type WithParams<T> = { params: T };
