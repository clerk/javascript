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

describe('email link readiness', () => {
  afterEach(() => vi.restoreAllMocks());

  it('signals successful preparation without completing the verification promise', async () => {
    const email = new EmailAddress({ id: 'email_123' }, '/me/email_addresses');
    const held = createDeferredPromise();
    vi.spyOn(email, 'prepareVerification').mockImplementation(async () => {
      await held.promise;
      return email;
    });
    const reload = vi.spyOn(email, 'reload').mockImplementation(() => new Promise(() => {}));
    const prepared = vi.fn();
    const complete = vi.fn();
    const flow = email.createEmailLinkFlow();
    void flow.startEmailLinkFlow({ redirectUrl: '/verify', onPrepared: prepared }).then(complete);
    expect(prepared).not.toHaveBeenCalled();
    held.resolve();
    await vi.waitFor(() => expect(prepared).toHaveBeenCalledOnce());
    expect(reload).toHaveBeenCalledOnce();
    expect(complete).not.toHaveBeenCalled();
    flow.cancelEmailLinkFlow();
  });

  it.each(['during preparation', 'from readiness'] as const)(
    'does not start polling when cancelled %s',
    async phase => {
      const email = new EmailAddress({ id: 'email_123' }, '/me/email_addresses');
      const held = createDeferredPromise();
      vi.spyOn(email, 'prepareVerification').mockImplementation(async () => {
        await held.promise;
        return email;
      });
      const reload = vi.spyOn(email, 'reload');
      const flow = email.createEmailLinkFlow();
      const prepared = vi.fn(() => flow.cancelEmailLinkFlow());
      void flow.startEmailLinkFlow({ redirectUrl: '/verify', onPrepared: prepared });
      if (phase === 'during preparation') {
        flow.cancelEmailLinkFlow();
      }
      held.resolve();
      await held.promise;
      await Promise.resolve();
      await Promise.resolve();
      expect(prepared).toHaveBeenCalledTimes(phase === 'during preparation' ? 0 : 1);
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it('rejects failed preparation without reporting readiness and allows retry', async () => {
    const email = new EmailAddress({ id: 'email_123' }, '/me/email_addresses');
    vi.spyOn(email, 'prepareVerification').mockRejectedValueOnce(new Error('send failed')).mockResolvedValue(email);
    email.verification.status = 'verified';
    vi.spyOn(email, 'reload').mockResolvedValue(email);
    const prepared = vi.fn();
    const flow = email.createEmailLinkFlow();
    await expect(flow.startEmailLinkFlow({ redirectUrl: '/verify', onPrepared: prepared })).rejects.toThrow(
      'send failed',
    );
    expect(prepared).not.toHaveBeenCalled();
    await expect(flow.startEmailLinkFlow({ redirectUrl: '/verify', onPrepared: prepared })).resolves.toBe(email);
    expect(prepared).toHaveBeenCalledOnce();
  });
});
