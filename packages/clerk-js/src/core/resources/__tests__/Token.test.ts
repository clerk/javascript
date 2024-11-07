import { SUPPORTED_FAPI_VERSION } from '../../constants';
import { createFapiClient } from '../../fapiClient';
import { mockDevClerkInstance, mockFetch, mockNetworkFailedFetch } from '../../test/fixtures';
import { BaseResource } from '../internal';
import { Token } from '../Token';

describe('Token', () => {
  describe('create', () => {
    afterEach(() => {
      // @ts-ignore
      global.fetch?.mockClear();
      BaseResource.clerk = null as any;
    });

    it('with http 500 throws error', async () => {
      mockFetch(false, 500);
      BaseResource.clerk = { getFapiClient: () => createFapiClient(mockDevClerkInstance) } as any;

      await expect(Token.create('/path/to/tokens')).rejects.toMatchObject({
        message: '500',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test-0.0.0`,
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
        BaseResource.clerk = { getFapiClient: () => createFapiClient(mockDevClerkInstance) } as any;

        const token = await Token.create('/path/to/tokens');

        expect(global.fetch).toHaveBeenCalledWith(
          `https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test-0.0.0`,
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
        BaseResource.clerk = { getFapiClient: () => createFapiClient(mockDevClerkInstance) } as any;

        await expect(Token.create('/path/to/tokens')).rejects.toThrow(
          `ClerkJS: Network error at "https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test-0.0.0" - TypeError: Failed to fetch. Please try again.`,
        );

        expect(global.fetch).toHaveBeenCalledWith(
          `https://clerk.example.com/v1/path/to/tokens?__clerk_api_version=${SUPPORTED_FAPI_VERSION}&_clerk_js_version=test-0.0.0`,
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
