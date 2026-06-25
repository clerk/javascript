import { describe, expect, it } from 'vitest';

import { ExternalAccount } from '../ExternalAccount';
import type { ExternalAccountJSON } from '../JSON';

describe('ExternalAccount', () => {
  describe('fromJSON', () => {
    const base = {
      object: 'external_account',
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
    };

    it('maps external_account_id to externalAccountId for Google/Facebook accounts', () => {
      // Google/Facebook responses set `id` to the `idn_` identification id and add `external_account_id`.
      const data = {
        ...base,
        id: 'idn_2ABXLLckIF5kLikvzAVRxuuN31M',
        external_account_id: 'eac_2ABXLObDmeHsnLsLgOd5panvOPJ',
        identification_id: 'idn_2ABXLLckIF5kLikvzAVRxuuN31M',
      } as ExternalAccountJSON;

      const externalAccount = ExternalAccount.fromJSON(data);

      expect(externalAccount.externalAccountId).toBe('eac_2ABXLObDmeHsnLsLgOd5panvOPJ');
      // `id` and `identificationId` keep the `idn_` value for these providers.
      expect(externalAccount.id).toBe('idn_2ABXLLckIF5kLikvzAVRxuuN31M');
      expect(externalAccount.identificationId).toBe('idn_2ABXLLckIF5kLikvzAVRxuuN31M');
    });

    it('leaves externalAccountId undefined for other providers, where id is already the eac_ id', () => {
      // Other providers omit `external_account_id`; `id` already holds the `eac_` value.
      const data = {
        ...base,
        provider: 'oauth_github',
        id: 'eac_2ABXLObDmeHsnLsLgOd5panvOPJ',
        identification_id: 'idn_2ABXLLckIF5kLikvzAVRxuuN31M',
      } as ExternalAccountJSON;

      const externalAccount = ExternalAccount.fromJSON(data);

      expect(externalAccount.externalAccountId).toBeUndefined();
      expect(externalAccount.id).toBe('eac_2ABXLObDmeHsnLsLgOd5panvOPJ');
    });
  });
});
