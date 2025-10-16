import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { BaseResource } from '../internal';
import { SignIn } from '../SignIn';

describe('SignIn', () => {
  describe('signIn.create', () => {
    afterEach(() => {
      vi.clearAllMocks();
      vi.unstubAllGlobals();
    });

    it('includes locale in request body when navigator.language is available', async () => {
      vi.stubGlobal('navigator', { language: 'fr-FR' });

      const mockFetch = vi.fn().mockResolvedValue({
        client: null,
        response: { id: 'signin_123', status: 'needs_first_factor' },
      });
      BaseResource._fetch = mockFetch;

      const signIn = new SignIn();
      await signIn.create({ identifier: 'user@example.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
            locale: 'fr-FR',
          },
        }),
      );
    });

    it('excludes locale from request body when navigator.language is empty', async () => {
      vi.stubGlobal('navigator', { language: '' });

      const mockFetch = vi.fn().mockResolvedValue({
        client: null,
        response: { id: 'signin_123', status: 'needs_first_factor' },
      });
      BaseResource._fetch = mockFetch;

      const signIn = new SignIn();
      await signIn.create({ identifier: 'user@example.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/client/sign_ins',
          body: {
            identifier: 'user@example.com',
          },
        }),
      );
    });
  });

  describe('SignInFuture', () => {
    describe('selectFirstFactor', () => {
      beforeAll(() => {
        const signInCreatedJSON = {
          id: 'test_id',

          supported_first_factors: [
            { strategy: 'email_code', emailAddressId: 'email_address_0', safe_identifier: 'test+abc@clerk.com' },
            { strategy: 'email_code', emailAddressId: 'email_address_1', safe_identifier: 'test@clerk.com' },
            { strategy: 'phone_code', phoneNumberId: 'phone_number_1', safe_identifier: '+301234567890' },
          ],
        };

        const firstFactorPreparedJSON = {};

        BaseResource._fetch = vi.fn().mockImplementation(({ method, path, body }) => {
          if (method === 'POST' && path === '/client/sign_ins') {
            return Promise.resolve({
              client: null,
              response: { ...signInCreatedJSON, identifier: body.identifier },
            });
          }

          if (method === 'POST' && path === '/client/sign_ins/test_id/prepare_first_factor') {
            return Promise.resolve({
              client: null,
              response: firstFactorPreparedJSON,
            });
          }

          throw new Error('Unexpected call to BaseResource._fetch');
        });
      });

      it('should select correct first factor by email address', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.emailCode.sendCode({ emailAddress: 'test@clerk.com' });
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_1',
            strategy: 'email_code',
          },
        });
      });

      it('should select correct first factor by email address ID', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'test@clerk.com' });
        await signIn.__internal_future.emailCode.sendCode({ emailAddressId: 'email_address_1' });
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_1',
            strategy: 'email_code',
          },
        });
      });

      it('should select correct first factor matching identifier when nothing is provided', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: 'test@clerk.com' });
        await signIn.__internal_future.emailCode.sendCode();
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_1',
            strategy: 'email_code',
          },
        });
      });

      it('should select correct first factor when nothing is provided', async () => {
        const signIn = new SignIn();
        await signIn.__internal_future.create({ identifier: '+12255550000' });
        await signIn.__internal_future.emailCode.sendCode();
        expect(BaseResource._fetch).toHaveBeenLastCalledWith({
          method: 'POST',
          path: '/client/sign_ins/test_id/prepare_first_factor',
          body: {
            emailAddressId: 'email_address_0',
            strategy: 'email_code',
          },
        });
      });
    });
  });
});
