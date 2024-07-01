import type {
  ActiveSessionResource,
  Clerk,
  ClientResource,
  InitialState,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import { atom, map } from 'nanostores';

// Deprecation warning as for not for the authors of this library

/**
 * @deprecated Use the individual stores exported from `/client/stores`
 */
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

/**
 * @deprecated Use the individual stores exported from `/client/stores`
 */
export const $initialState = map<InitialState>();

// Use atom instead of `map` to prohibit key changes and allow only replacing the whole object
/**
 * @deprecated Use the individual stores exported from `/client/stores`
 */
export const $clerk = atom<Clerk | null>(null);
