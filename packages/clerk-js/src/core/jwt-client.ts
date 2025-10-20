import { __experimental_JWTPayloadToAuthObjectProperties } from '@clerk/shared/jwtPayloadParser';
import type {
  ClientJSON,
  OrganizationMembershipJSON,
  PartialWithClerkResource,
  PublicUserDataJSON,
  SessionJSON,
  TokenJSON,
  UserJSON,
} from '@clerk/shared/types';

import { Token } from './resources';
import { Client } from './resources/Client';

/**
 * Create a new client instance from a jwt.
 * The caller is responsible for reading the jwt from the `__session` cookie.
 */
export function createClientFromJwt(jwt: string | undefined | null): Client {
  // Use `Token` class to parse the JWT token
  let token: Token | null;

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

  const { sessionId, userId, orgId, orgRole, orgPermissions, orgSlug, factorVerificationAge } =
    __experimental_JWTPayloadToAuthObjectProperties(token.jwt.claims);

  // TODO(jwt-v2): when JWT version 2 is available, we should revise org permissions
  const defaultClient = {
    object: 'client',
    last_active_session_id: sessionId,
    id: 'client_init',
    sessions: [
      {
        object: 'session',
        id: sessionId,
        status: 'active',
        last_active_organization_id: orgId || null,
        // @ts-expect-error - ts is not happy about `id:undefined`, but this is allowed and expected
        last_active_token: {
          id: undefined,
          object: 'token',
          jwt,
        } as TokenJSON,
        factor_verification_age: factorVerificationAge || null,
        public_user_data: {
          user_id: userId,
        } as PublicUserDataJSON,
        user: {
          object: 'user',
          id: userId,
          organization_memberships:
            orgId && orgSlug && orgRole
              ? [
                  {
                    object: 'organization_membership',
                    id: orgId,
                    role: orgRole,
                    permissions: orgPermissions || [],
                    organization: {
                      object: 'organization',
                      id: orgId,
                      // Use slug as name for the organization, since name is not available in the token.
                      name: orgSlug,
                      slug: orgSlug,
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
