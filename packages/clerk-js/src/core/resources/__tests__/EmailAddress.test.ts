import type { EmailAddressJSON } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
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

    it('does not coalesce preparations with different strategies or params', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        response: { id: 'email_123' },
      });
      BaseResource._fetch = mockFetch;

      const emailAddress = new EmailAddress({ id: 'email_123' } as EmailAddressJSON, '/me/email_addresses');

      await Promise.all([
        emailAddress.prepareVerification({ strategy: 'email_code' }),
        emailAddress.prepareVerification({ strategy: 'email_link', redirectUrl: '/verify-one' }),
        emailAddress.prepareVerification({ strategy: 'email_link', redirectUrl: '/verify-two' }),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(3);
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

    it('starts a new preparation after the previous request fails', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('prepare failed'))
        .mockResolvedValueOnce({
          response: { id: 'email_123' },
        });
      BaseResource._fetch = mockFetch;

      const emailAddress = new EmailAddress({ id: 'email_123' } as EmailAddressJSON, '/me/email_addresses');
      const params = { strategy: 'email_code' as const };

      await expect(emailAddress.prepareVerification(params)).rejects.toThrow('prepare failed');
      await emailAddress.prepareVerification(params);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('does not coalesce preparations across EmailAddress instances', async () => {
      const deferred = createDeferredPromise<any>();
      const mockFetch = vi.fn().mockReturnValue(deferred.promise);
      BaseResource._fetch = mockFetch;

      const firstEmailAddress = new EmailAddress({ id: 'email_123' } as EmailAddressJSON, '/me/email_addresses');
      const secondEmailAddress = new EmailAddress({ id: 'email_123' } as EmailAddressJSON, '/me/email_addresses');
      const params = { strategy: 'email_code' as const };

      const first = firstEmailAddress.prepareVerification(params);
      const second = secondEmailAddress.prepareVerification(params);

      expect(mockFetch).toHaveBeenCalledTimes(2);

      deferred.resolve({
        response: { id: 'email_123' },
      });
      await Promise.all([first, second]);
    });

    it('does not coalesce concurrent verification attempts', async () => {
      const deferred = createDeferredPromise<any>();
      const mockFetch = vi.fn().mockReturnValue(deferred.promise);
      BaseResource._fetch = mockFetch;

      const emailAddress = new EmailAddress({ id: 'email_123' } as EmailAddressJSON, '/me/email_addresses');
      const params = { code: '123456' };

      const first = emailAddress.attemptVerification(params);
      const second = emailAddress.attemptVerification(params);

      expect(mockFetch).toHaveBeenCalledTimes(2);

      deferred.resolve({
        response: { id: 'email_123' },
      });
      await Promise.all([first, second]);
    });
  });
});
