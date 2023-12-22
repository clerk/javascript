import type { LoadedClerk } from '@clerk/types';

export type FieldDetails = {
  type?: string;
  value?: string | readonly string[] | number;
  error?: Error;
};

export type SignInResourceParams<T> = {
  client: LoadedClerk['client'];
  params: T;
};
