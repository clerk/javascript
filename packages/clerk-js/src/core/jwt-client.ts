import type { ClientJSON, TokenJSON } from '@clerk/types';

import { Token } from './resources';
import { Client } from './resources/Client';

export function createClientFromJwt(jwt: string | undefined | null): Client | null {
  if (!jwt) {
    return null;
  }

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

  Client.clearInstance();

  if (!token?.jwt) {
    return Client.getOrCreateInstance({
      object: 'client',
      last_active_session_id: null,
      id: 'client_init',
      sessions: [],
      created_at: Date.now(),
      updated_at: Date.now(),
      cookie_expires_at: null,
      sign_in: null,
      sign_up: null,
    } as ClientJSON);
  }

  return Client.getOrCreateInstance({
    object: 'client',
    last_active_session_id: token.jwt.claims.sid,
    id: 'client_init',
    sessions: [
      {
        object: 'session',
        status: 'active',
        actor: null,
        id: token.jwt.claims.sid,
        created_at: 0,
        updated_at: 0,
        abandon_at: 0,
        expire_at: 0,
        last_active_at: Date.now(),
        last_active_organization_id: token.jwt.claims.org_id || null,
        // @ts-expect-error - ts is not happy about `id:undefined`, but this is allowed and expected
        last_active_token: {
          id: undefined,
          object: 'token',
          jwt,
        } as TokenJSON,
        tasks: null,
        factor_verification_age: token.jwt.claims.fva ?? null,
        public_user_data: {
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
          created_at: 0,
          updated_at: 0,
          public_metadata: {},
          primary_email_address_id: null,
          primary_phone_number_id: null,
          primary_web3_wallet_id: null,
          unsafe_metadata: {},
          legal_accepted_at: null,
          totp_enabled: false,
          profile_image_id: '',
          backup_code_enabled: false,
          two_factor_enabled: false,
          last_sign_in_at: null,
          create_organizations_limit: null,
          delete_self_enabled: false,
          external_accounts: [],
          passkeys: [],
          email_addresses: [],
          phone_numbers: [],
          saml_accounts: [],
          web3_wallets: [],
          enterprise_accounts: [],
          organization_memberships:
            token.jwt.claims.org_id && token.jwt.claims.org_slug && token.jwt.claims.org_role
              ? [
                  {
                    object: 'organization_membership',
                    id: token.jwt.claims.org_id,
                    role: token.jwt.claims.org_role,
                    permissions: token.jwt?.claims?.org_permissions ?? [],
                    public_metadata: {},
                    public_user_data: {
                      first_name: null,
                      last_name: null,
                      image_url: '',
                      has_image: false,
                      identifier: '',
                      user_id: token.jwt.claims.sub,
                    },
                    created_at: 0,
                    updated_at: 0,
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
                      pending_invitations_count: 0,
                      public_metadata: {},
                      max_allowed_memberships: 1,
                      admin_delete_enabled: false,
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
    sign_in: null,
    sign_up: null,
  } as ClientJSON);
}
