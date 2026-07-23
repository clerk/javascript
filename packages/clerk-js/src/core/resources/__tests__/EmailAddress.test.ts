import { createDeferredPromise } from '@clerk/shared/utils';
import type { EmailAddressJSON } from '@clerk/shared/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseResource, EmailAddress } from '../internal';

describe('EmailAddress', () => {
  describe('prepareVerification', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('coalesces concurrent identical preparations', async () => {
      const deferred = createDeferredPromise<any>();
      const mockFetch = vi.fn().mockReturnValue(deferred.promise);
      // @ts-ignore
      BaseResource._fetch = mockFetch;

      const emailAddress = new EmailAddress({ id: 'email_123' } as EmailAddressJSON, '/me/email_addresses');
      const params = { strategy: 'email_code' as const };

      const first = emailAddress.prepareVerification(params);
      const second = emailAddress.prepareVerification(params);

      expect(mockFetch).toHaveBeenCalledTimes(1);

      deferred.resolve({
        response: { id: 'email_123' },
      });
      await Promise.all([first, second]);
    });

    it('starts a new preparation after the previous request succeeds', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        response: { id: 'email_123' },
      });
      // @ts-ignore
      BaseResource._fetch = mockFetch;

      const emailAddress = new EmailAddress({ id: 'email_123' } as EmailAddressJSON, '/me/email_addresses');
      const params = { strategy: 'email_code' as const };

      await emailAddress.prepareVerification(params);
      await emailAddress.prepareVerification(params);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
