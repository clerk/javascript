import type { ClientResource } from '@clerk/types';

export type FieldDetails = {
  type?: string;
  value?: string | readonly string[] | number;
  error?: Error;
};

export type SignInClient = ClientResource;

export type SignInResourceParams<T> = {
  client: SignInClient;
  params: T;
};
