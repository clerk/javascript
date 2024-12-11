import type {
  ActiveSessionResource,
  Clerk,
  ClientResource,
  InitialState,
  OrganizationResource,
  PendingSessionResource,
  UserResource,
} from '@clerk/types';
import { atom, map } from 'nanostores';

export const $csrState = map<{
  isLoaded: boolean;
  client: ClientResource | undefined | null;
  user: UserResource | undefined | null;
  session: ActiveSessionResource | PendingSessionResource | undefined | null;
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
