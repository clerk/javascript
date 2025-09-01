import type { InstanceType } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { mockFetch, mockJwt, mockNetworkFailedFetch } from '@/test/core-fixtures';
import { debugLogger } from '@/utils/debug';

import { SUPPORTED_FAPI_VERSION } from '../../constants';
import { createFapiClient } from '../../fapiClient';
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
      (global.fetch as Mock)?.mockClear();
      BaseResource.clerk = null as any;
    });

    it('with http 500 throws error', async () => {
      mockFetch(false, 500);
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      await expect(Token.create('/path/to/tokens')).rejects.toMatchObject({
        message: '500',
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).toContain('https://clerk.example.com/v1/path/to/tokens');
      expect(options).toMatchObject({
        method: 'POST',
        body: '',
        credentials: 'include',
        headers: expect.any(Headers),
      });
    });

    describe('with offline browser and network failure', () => {
      let warnSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false,
        });
        warnSpy = vi.spyOn(debugLogger, 'warn').mockReturnValue();
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

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [url, options] = (global.fetch as Mock).mock.calls[0];
        expect(url.toString()).toContain('https://clerk.example.com/v1/path/to/tokens');
        expect(options).toMatchObject({
          method: 'POST',
          body: '',
          credentials: 'include',
          headers: expect.any(Headers),
        });

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

        expect(global.fetch).toHaveBeenCalledTimes(1);
        const [url, options] = (global.fetch as Mock).mock.calls[0];
        expect(url.toString()).toContain('https://clerk.example.com/v1/path/to/tokens');
        expect(options).toMatchObject({
          method: 'POST',
          body: '',
          credentials: 'include',
          headers: expect.any(Headers),
        });
      });
    });

    it('creates token successfully with valid response', async () => {
      mockFetch(true, 200, { jwt: mockJwt });
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      const token = await Token.create('/path/to/tokens', { organizationId: 'org_123' });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).toContain('https://clerk.example.com/v1/path/to/tokens');
      expect(url.toString()).not.toContain('debug=skip_cache');
      expect(options).toMatchObject({
        body: 'organization_id=org_123',
        credentials: 'include',
        method: 'POST',
      });
      expect(token).toBeInstanceOf(Token);
      expect(token.jwt).toBeDefined();
    });

    it('creates token with skipCache=false by default', async () => {
      mockFetch(true, 200, { jwt: mockJwt });
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      await Token.create('/path/to/tokens');

      const [url] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).not.toContain('debug=skip_cache');
    });

    it('creates token with skipCache=true and includes query parameter', async () => {
      mockFetch(true, 200, { jwt: mockJwt });
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      await Token.create('/path/to/tokens', {}, true);

      const [url] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).toContain('debug=skip_cache');
    });

    it('creates token with skipCache=false explicitly and excludes query parameter', async () => {
      mockFetch(true, 200, { jwt: mockJwt });
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      await Token.create('/path/to/tokens', {}, false);

      const [url] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).not.toContain('debug=skip_cache');
    });
  });

  describe('create with search parameters', () => {
    afterEach(() => {
      (global.fetch as Mock)?.mockClear();
      BaseResource.clerk = null as any;
    });

    it('should include search parameters in the API request', async () => {
      mockFetch(true, 200, { object: 'token', jwt: mockJwt });
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      await Token.create('/path/to/tokens', {}, { expired_token: 'some_expired_token' });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).toContain('https://clerk.example.com/v1/path/to/tokens');
      expect(url.toString()).toContain('expired_token=some_expired_token');
      expect(options).toMatchObject({
        method: 'POST',
        credentials: 'include',
        headers: expect.any(Headers),
      });
    });

    it('should work without search parameters (backward compatibility)', async () => {
      mockFetch(true, 200, { object: 'token', jwt: mockJwt });
      BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

      await Token.create('/path/to/tokens');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).toContain('https://clerk.example.com/v1/path/to/tokens');
      expect(options).toMatchObject({
        method: 'POST',
        body: '',
        credentials: 'include',
        headers: expect.any(Headers),
      });
    });
  });
});
