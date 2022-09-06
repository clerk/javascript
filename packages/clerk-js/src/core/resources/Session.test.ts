import { PublicUserDataJSON, SessionJSON, TokenJSON, UserJSON } from '@clerk/types';

import { Session } from './Session';

describe('Session', () => {
  describe('isImpersonated()', () => {
    it('returns true for session with actorId', () => {
      const json = {
        object: 'session',
        id: 'sess_123',
        status: 'active',
        expire_at: 123,
        abandon_at: 123,
        last_active_at: 123,
        last_active_organization_id: null,
        last_active_token: null as unknown as TokenJSON,
        user: {
          object: 'user',
          id: 'test',
          external_id: 'test',
          primary_email_address_id: 'test',
          primary_phone_number_id: 'test',
          primary_web3_wallet_id: 'test',
          profile_image_url: 'test',
          username: 'test',
          email_addresses: [],
          phone_numbers: [],
          web3_wallets: [],
          external_accounts: [],
          organization_memberships: [],
          password_enabled: false,
          password: 'test',
          profile_image_id: 'test',
          first_name: 'test',
          last_name: 'test',
          totp_enabled: false,
          two_factor_enabled: false,
          public_metadata: {},
          unsafe_metadata: {},
          last_sign_in_at: 123,
          updated_at: 123,
          created_at: 123,
        } as UserJSON,
        public_user_data: null as unknown as PublicUserDataJSON,
        created_at: 123,
        updated_at: 123,
      };
      let session = new Session({ ...json, actor_id: 'the-id' } as SessionJSON);
      expect(session.isImpersonated()).toEqual(true);

      session = new Session({ ...json, actor_id: null } as SessionJSON);
      expect(session.isImpersonated()).toEqual(false);
    });
  });
});
