import type { InstanceType } from '@clerk/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { SUPPORTED_FAPI_VERSION } from '../../constants';
import { createFapiClient } from '../../fapiClient';
import { mockFetch, mockNetworkFailedFetch } from '../../vitest/fixtures';
import { BaseResource } from '../internal';
import { Token } from '../Token';

const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');

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
      let warnSpy: any;

      beforeEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false,
        });
        warnSpy = vi.spyOn(console, 'warn').mockReturnValue();
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

  it('has the same initial properties', () => {
    const token = new Token({
      object: 'token',
      id: 'token_123',
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    });

    expect(token).toMatchObject({
      jwt: expect.any(Object),
    });
  });
});

describe('Token Snapshots', () => {
  it('should match snapshot for token structure', () => {
    const token = new Token({
      object: 'token',
      id: 'token_123',
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    });

    const snapshot = {
      jwt: token.jwt,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for null jwt token', () => {
    const token = new Token({
      object: 'token',
      id: 'token_456',
      jwt: '',
    });

    const snapshot = {
      jwt: token.jwt,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const token = new Token({
      object: 'token',
      id: 'token_snapshot',
      jwt: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVDlwUkZST0NnYlJPRW1DbDNlX1ZYOEVfMVJSZWJUQ3JfQWZlWXciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLmV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NzAwLCJpYXQiOjE3MzU2ODk2MDAsImlzcyI6Imh0dHBzOi8vY2xlcmsuZXhhbXBsZS5jb20iLCJuYmYiOjE3MzU2ODk1OTAsInN1YiI6InVzZXJfMTIzIn0.signature',
    });

    expect(token.__internal_toSnapshot()).toMatchSnapshot();

    vi.useRealTimers();
  });
});
