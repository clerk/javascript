import type {
  ClientJSON,
  OrganizationMembershipJSON,
  PartialWithClerkResource,
  PublicUserDataJSON,
  SessionJSON,
  TokenJSON,
  UserJSON,
} from '@clerk/types';

import { Token } from './resources';
import { Client } from './resources/Client';

/**
 * Create a new client instance from a jwt.
 * The caller is responsible for reading the jwt from the `__session` cookie.
 */
export function createClientFromJwt(jwt: string | undefined | null): Client {
  // Use `Token` class to parse the JWT token
  let token;

  try {
    token = new Token({
      jwt: jwt || '',
      object: 'token',
      // @ts-expect-error - ts is not happy about it, but this is allowed
      id: undefined,
    });
  } catch {
    // If the token is invalid, return null
    token = null;
  }

  // Clean up singleton instance
  Client.clearInstance();

  if (!token?.jwt) {
    return Client.getOrCreateInstance({
      object: 'client',
      last_active_session_id: null,
      id: 'client_init',
      sessions: [],
    } as unknown as ClientJSON);
  }

  const { sid, sub, org_id, org_role, org_permissions, org_slug, fva } = token.jwt.claims;

  const defaultClient = {
    object: 'client',
    last_active_session_id: sid,
    id: 'client_init',
    sessions: [
      {
        object: 'session',
        id: sid,
        status: 'active',
        last_active_organization_id: org_id || null,
        // @ts-expect-error - ts is not happy about `id:undefined`, but this is allowed and expected
        last_active_token: {
          id: undefined,
          object: 'token',
          jwt,
        } as TokenJSON,
        factor_verification_age: fva || null,
        public_user_data: {
          user_id: sub,
        } as PublicUserDataJSON,
        user: {
          object: 'user',
          id: sub,
          organization_memberships:
            org_id && org_slug && org_role
              ? [
                  {
                    object: 'organization_membership',
                    id: org_id,
                    role: org_role,
                    permissions: org_permissions || [],
                    organization: {
                      object: 'organization',
                      id: org_id,
                      name: '',
                      slug: org_slug,
                      members_count: 1,
                      max_allowed_memberships: 1,
                    },
                  } as PartialWithClerkResource<OrganizationMembershipJSON>,
                ]
              : [],
        } as PartialWithClerkResource<UserJSON>,
      } as PartialWithClerkResource<SessionJSON>,
    ],
  } as ClientJSON;

  return Client.getOrCreateInstance(defaultClient);
}
