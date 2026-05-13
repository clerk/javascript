import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { InstanceType, OAuthConsentInfoJSON } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { mockFetch } from '@/test/core-fixtures';

import { SUPPORTED_FAPI_VERSION } from '../../../constants';
import { createFapiClient } from '../../../fapiClient';
import { BaseResource } from '../../../resources/internal';
import { OAuthApplication } from '../index';

const consentPayload: OAuthConsentInfoJSON = {
  object: 'oauth_consent_info',
  id: 'client_abc',
  oauth_application_name: 'My App',
  oauth_application_logo_url: 'https://img.example/logo.png',
  oauth_application_url: 'https://app.example',
  client_id: 'client_abc',
  state: 'st',
  scopes: [{ scope: 'openid', description: 'OpenID', requires_consent: true }],
};

describe('OAuthApplication', () => {
  let oauthApp: OAuthApplication;

  beforeEach(() => {
    oauthApp = new OAuthApplication();
  });

  afterEach(() => {
    (global.fetch as Mock)?.mockClear?.();
    BaseResource.clerk = null as any;
    vi.restoreAllMocks();
  });

  describe('getConsentInfo', () => {
    it('calls _fetch with GET, encoded path, optional scope, and skipUpdateClient', async () => {
      const fetchSpy = vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
        response: consentPayload,
      } as any);

      BaseResource.clerk = {} as any;

      await oauthApp.getConsentInfo({ oauthClientId: 'my/client id', scope: 'openid email' });

      expect(fetchSpy).toHaveBeenCalledWith(
        {
          method: 'GET',
          path: '/me/oauth/consent/my%2Fclient%20id',
          search: { scope: 'openid email' },
        },
        { skipUpdateClient: true },
      );
    });

    it('omits search when scope is undefined', async () => {
      const fetchSpy = vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
        response: consentPayload,
      } as any);

      BaseResource.clerk = {} as any;

      await oauthApp.getConsentInfo({ oauthClientId: 'cid' });

      expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({ search: undefined }), { skipUpdateClient: true });
    });

    it('returns OAuthConsentInfo from a non-enveloped FAPI response', async () => {
      vi.spyOn(BaseResource, '_fetch').mockResolvedValue(consentPayload as any);

      BaseResource.clerk = {} as any;

      const info = await oauthApp.getConsentInfo({ oauthClientId: 'client_abc' });

      expect(info).toEqual({
        oauthApplicationName: 'My App',
        oauthApplicationLogoUrl: 'https://img.example/logo.png',
        oauthApplicationUrl: 'https://app.example',
        clientId: 'client_abc',
        state: 'st',
        scopes: [{ scope: 'openid', description: 'OpenID', requiresConsent: true }],
      });
    });

    it('returns OAuthConsentInfo from an enveloped FAPI response', async () => {
      vi.spyOn(BaseResource, '_fetch').mockResolvedValue({ response: consentPayload } as any);

      BaseResource.clerk = {} as any;

      const info = await oauthApp.getConsentInfo({ oauthClientId: 'client_abc' });

      expect(info).toEqual({
        oauthApplicationName: 'My App',
        oauthApplicationLogoUrl: 'https://img.example/logo.png',
        oauthApplicationUrl: 'https://app.example',
        clientId: 'client_abc',
        state: 'st',
        scopes: [{ scope: 'openid', description: 'OpenID', requiresConsent: true }],
      });
    });

    it('defaults scopes to [] when absent', async () => {
      vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
        response: { ...consentPayload, scopes: undefined },
      } as any);

      BaseResource.clerk = {} as any;

      const info = await oauthApp.getConsentInfo({ oauthClientId: 'client_abc' });
      expect(info.scopes).toEqual([]);
    });

    it('throws ClerkAPIResponseError on non-2xx', async () => {
      mockFetch(false, 422, {
        errors: [{ code: 'oauth_consent_error', long_message: 'Consent metadata unavailable' }],
      });

      BaseResource.clerk = {
        getFapiClient: () =>
          createFapiClient({
            frontendApi: 'clerk.example.com',
            getSessionId: () => undefined,
            instanceType: 'development' as InstanceType,
          }),
        __internal_setCountry: vi.fn(),
        handleUnauthenticated: vi.fn(),
        __internal_handleUnauthenticatedDevBrowser: vi.fn(),
      } as any;

      await expect(oauthApp.getConsentInfo({ oauthClientId: 'cid' })).rejects.toSatisfy(
        (err: unknown) => err instanceof ClerkAPIResponseError && err.message === 'Consent metadata unavailable',
      );

      const [url] = (global.fetch as Mock).mock.calls[0];
      expect(url.toString()).toContain('/v1/me/oauth/consent/cid');
      expect(url.toString()).toContain(`__clerk_api_version=${SUPPORTED_FAPI_VERSION}`);
    });

    it('throws ClerkRuntimeError with network_error when _fetch returns null', async () => {
      vi.spyOn(BaseResource, '_fetch').mockResolvedValue(null);

      BaseResource.clerk = {} as any;

      await expect(oauthApp.getConsentInfo({ oauthClientId: 'cid' })).rejects.toMatchObject({
        code: 'network_error',
      });
    });
  });

  describe('buildConsentActionUrl', () => {
    // Minimal fapiClient mock: constructs a URL from path + sessionId the same
    // way the real fapiClient does, so assertions on the returned URL still work.
    const makeFapiClient = () => ({
      buildUrl: ({ path, sessionId }: { path?: string; sessionId?: string }) => {
        const url = new URL(`https://clerk.example.com/v1${path}`);
        if (sessionId) {
          url.searchParams.set('_clerk_session_id', sessionId);
        }
        return url;
      },
    });

    it('returns a URL with the correct FAPI path', () => {
      BaseResource.clerk = {
        session: { id: 'sess_123' },
        buildUrlWithAuth: (url: string) => url,
        getFapiClient: () => makeFapiClient(),
      } as any;

      const result = oauthApp.buildConsentActionUrl({ clientId: 'client_abc' });

      expect(result).toContain('/v1/me/oauth/consent/client_abc');
    });

    it('URL-encodes the client ID', () => {
      BaseResource.clerk = {
        session: { id: 'sess_123' },
        buildUrlWithAuth: (url: string) => url,
        getFapiClient: () => makeFapiClient(),
      } as any;

      const result = oauthApp.buildConsentActionUrl({ clientId: 'my/client id' });

      expect(result).toContain('/v1/me/oauth/consent/my%2Fclient%20id');
    });

    it('appends _clerk_session_id when session exists', () => {
      BaseResource.clerk = {
        session: { id: 'sess_123' },
        buildUrlWithAuth: (url: string) => url,
        getFapiClient: () => makeFapiClient(),
      } as any;

      const result = oauthApp.buildConsentActionUrl({ clientId: 'cid' });

      expect(new URL(result).searchParams.get('_clerk_session_id')).toBe('sess_123');
    });

    it('omits _clerk_session_id when session is null', () => {
      BaseResource.clerk = {
        session: null,
        buildUrlWithAuth: (url: string) => url,
        getFapiClient: () => makeFapiClient(),
      } as any;

      const result = oauthApp.buildConsentActionUrl({ clientId: 'cid' });

      expect(new URL(result).searchParams.has('_clerk_session_id')).toBe(false);
    });

    it('delegates to buildUrlWithAuth for dev browser JWT', () => {
      const buildUrlWithAuth = vi.fn((url: string) => `${url}&__clerk_db_jwt=devjwt`);
      BaseResource.clerk = {
        session: { id: 'sess_123' },
        buildUrlWithAuth,
        getFapiClient: () => makeFapiClient(),
      } as any;

      const result = oauthApp.buildConsentActionUrl({ clientId: 'cid' });

      expect(buildUrlWithAuth).toHaveBeenCalledOnce();
      expect(result).toContain('__clerk_db_jwt=devjwt');
    });
  });
});
