import type { ClientResource } from '@clerk/types';

export type SignInClient = ClientResource;

export type SignInResourceParams<T> = {
  client: SignInClient;
  params: T;
};
