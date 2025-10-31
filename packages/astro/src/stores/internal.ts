import type {
  Clerk,
  ClientResource,
  InitialState,
  OrganizationResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/shared/types';
import { atom, map } from 'nanostores';

export const $csrState = map<{
  isLoaded: boolean;
  client: ClientResource | undefined | null;
  user: UserResource | undefined | null;
  session: SignedInSessionResource | undefined | null;
  organization: OrganizationResource | undefined | null;
}>({
  isLoaded: false,
  client: undefined,
  user: undefined,
  session: undefined,
  organization: undefined,
});

export const $initialState = map<InitialState>();

// Use atom instead of `map` to prohibit key changes and allow only replacing the whole object
export const $clerk = atom<Clerk | null>(null);
