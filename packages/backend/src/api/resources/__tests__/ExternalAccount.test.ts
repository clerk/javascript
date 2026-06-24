import { describe, expect, it } from 'vitest';

import { ExternalAccount } from '../ExternalAccount';
import type { ExternalAccountJSON } from '../JSON';

describe('ExternalAccount', () => {
  describe('fromJSON', () => {
    const data: ExternalAccountJSON = {
      object: 'external_account',
      id: 'idn_2ABXLLckIF5kLikvzAVRxuuN31M',
      external_account_id: 'eac_2ABXLObDmeHsnLsLgOd5panvOPJ',
      identification_id: 'idn_2ABXLLckIF5kLikvzAVRxuuN31M',
      provider: 'oauth_google',
      provider_user_id: '1029384756',
      approved_scopes: 'email profile',
      email_address: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Doe',
      image_url: 'https://img.clerk.com/jane.png',
      username: 'jane',
      phone_number: null,
      public_metadata: {},
      label: null,
      verification: null,
    } as ExternalAccountJSON;

    it('maps external_account_id to externalAccountId', () => {
      const externalAccount = ExternalAccount.fromJSON(data);

      expect(externalAccount.externalAccountId).toBe('eac_2ABXLObDmeHsnLsLgOd5panvOPJ');
    });

    it('keeps id and identificationId pointing at the identification id', () => {
      const externalAccount = ExternalAccount.fromJSON(data);

      expect(externalAccount.id).toBe('idn_2ABXLLckIF5kLikvzAVRxuuN31M');
      expect(externalAccount.identificationId).toBe('idn_2ABXLLckIF5kLikvzAVRxuuN31M');
    });
  });
});
