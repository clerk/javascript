import type { InstanceType } from '@clerk/types';

import { SUPPORTED_FAPI_VERSION } from '../../constants';
import { createFapiClient } from '../../fapiClient';
import { mockFetch, mockNetworkFailedFetch } from '../../test/fixtures';
import { BaseResource } from '../internal';
import { Token } from '../Token';

const baseFapiClientOptions = {
  frontendApi: 'clerk.example.com',
  getSessionId() {
    return '';
  },
  instanceType: 'development' as InstanceType,
};

describe('Token', () => {
  describe('create', () => {
    afterEach(() => {
      (global.fetch as jest.Mock)?.mockClear();
      BaseResource.clerk = null as any;
    });

    it('with http 500 throws error', async () => {
      mockFetch(false, 500);
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      await expect(Token.create('/path/to/tokens')).rejects.toMatchObject({
        message: '500',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
        // TODO(dimkl): omit extra params from fetch request (eg path, url) - remove expect.objectContaining
        expect.objectContaining({
          method: 'POST',
          body: '',
          credentials: 'include',
          headers: new Headers(),
        }),
      );
    });

    describe('with offline browser and network failure', () => {
      let warnSpy;

      beforeEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false,
        });
        warnSpy = jest.spyOn(console, 'warn').mockReturnValue();
      });

      afterEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true,
        });
        warnSpy.mockRestore();
      });

      it('create returns empty raw string', async () => {
        mockNetworkFailedFetch();
        BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

        const token = await Token.create('/path/to/tokens');

        expect(global.fetch).toHaveBeenCalledWith(
          `https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
          // TODO(dimkl): omit extra params from fetch request (eg path, url) - remove expect.objectContaining
          expect.objectContaining({
            method: 'POST',
            body: '',
            credentials: 'include',
            headers: new Headers(),
          }),
        );

        expect(token.getRawString()).toEqual('');
        expect(warnSpy).toBeCalled();
      });
    });

    describe('with online browser and network failure', () => {
      it('throws error', async () => {
        mockNetworkFailedFetch();
        BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

        await expect(Token.create('/path/to/tokens')).rejects.toThrow(
          `ClerkJS: Network error at "https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test" - TypeError: Failed to fetch. Please try again.`,
        );

        expect(global.fetch).toHaveBeenCalledWith(
          `https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test`,
          // TODO(dimkl): omit extra params from fetch request (eg path, url) - remove expect.objectContaining
          expect.objectContaining({
            method: 'POST',
            body: '',
            credentials: 'include',
            headers: new Headers(),
          }),
        );
      });
    });
  });
});
