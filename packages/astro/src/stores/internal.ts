import type {
  ActiveSessionResource,
  Clerk,
  ClientResource,
  InitialState,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import { atom, map } from 'nanostores';

export const $csrState = map<{
  isLoaded: boolean;
  client: ClientResource | undefined | null;
  user: UserResource | undefined | null;
  session: ActiveSessionResource | undefined | null;
  organization: OrganizationResource | undefined | null;
}>({
  isLoaded: false,
  client: null,
  user: null,
  session: null,
  organization: null,
});

export const $initialState = map<InitialState>();

// Use atom instead of `map` to prohibit key changes and allow only replacing the whole object
export const $clerk = atom<Clerk | null>(null);
