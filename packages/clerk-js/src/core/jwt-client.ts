import { Token } from './resources';
import { Client } from './resources/Client';

export function createClientFromJwt(jwt: string): Client | null {
  // Use `Token` class to parse the JWT token
  let token;

  try {
    token = new Token({
      jwt,
      object: 'token',
      // @ts-expect-error - ts is not happy about it, but this is allowed
      id: undefined,
    });
  } catch {
    // If the token is invalid, return null
    token = null;
  }

  if (!token?.jwt) {
    return null;
  }

  Client.clearInstance();

  return Client.getOrCreateInstance({
    object: 'client',
    last_active_session_id: token.jwt.claims.sid,
    id: 'no_id',
    sessions: [
      {
        object: 'session',
        status: 'active',
        id: token.jwt.claims.sid,
        created_at: 0,
        updated_at: 0,
        abandon_at: 0,
        last_active_at: Date.now(),
        last_active_organization_id: token.jwt.claims.org_id || null,
        last_active_token: {
          // @ts-expect-error - ts is not happy about it, but this is allowed
          id: null,
          object: 'token',
          jwt,
        },
        tasks: null,
        factor_verification_age: token.jwt.claims.fva ?? null,
        public_user_data: {
          object: 'public_user_data',
          // @ts-expect-error - ts is not happy about it, but this is allowed
          id: null,
          first_name: null,
          last_name: null,
          image_url: '',
          has_image: false,
          identifier: '',
          user_id: token.jwt.claims.sub,
        },
        user: {
          object: 'user',
          id: token.jwt.claims.sub,
          create_organization_enabled: false,
          organization_memberships: token.jwt.claims.org_id
            ? [
                {
                  object: 'organization_membership',
                  id: token.jwt.claims.org_id,
                  role: token.jwt.claims.org_role,
                  permissions: token.jwt?.claims?.org_perms ?? undefined,
                  organization: {
                    object: 'organization',
                    id: token.jwt.claims.org_id,
                    name: '',
                    slug: token.jwt.claims.org_slug,
                    image_url: '',
                    has_image: false,
                    created_at: 0,
                    updated_at: 0,
                    members_count: 1,
                  },
                },
              ]
            : [],
          external_id: null,
          first_name: null,
          last_name: null,
          image_url: '',
          has_image: false,
          username: null,
          password_enabled: true,
        },
      },
    ],
    created_at: Date.now(),
    updated_at: Date.now(),
    cookie_expires_at: null,
    status: '',
    // @ts-expect-error - ts is not happy about it, but this is allowed
    sign_in: null,
    // @ts-expect-error - ts is not happy about it, but this is allowed
    sign_up: null,
  });
}
