import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { InstanceType, OAuthConsentInfoJSON } from '@clerk/shared/types';
import { afterEach, describe, expect, it, type Mock, vi } from 'vitest';

import { mockFetch } from '@/test/core-fixtures';

import { SUPPORTED_FAPI_VERSION } from '../../constants';
import { createFapiClient } from '../../fapiClient';
import { BaseResource } from '../internal';
import { OAuthApplication } from '../OAuthApplication';

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

describe('OAuthApplication.fetchConsentInfo', () => {
  afterEach(() => {
    (global.fetch as Mock)?.mockClear?.();
    BaseResource.clerk = null as any;
    vi.restoreAllMocks();
  });

  it('throws ClerkRuntimeError when there is no active session', async () => {
    const fetchSpy = vi.spyOn(BaseResource, '_fetch');

    BaseResource.clerk = {
      session: undefined,
    } as any;

    await expect(OAuthApplication.fetchConsentInfo({ oauthClientId: 'cid' })).rejects.toMatchObject({
      code: 'cannot_fetch_oauth_consent_no_session',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('calls BaseResource._fetch with GET, encoded path, sessionId, optional scope, and skipUpdateClient', async () => {
    const fetchSpy = vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: consentPayload,
    } as any);

    BaseResource.clerk = {
      session: { id: 'sess_test' },
    } as any;

    await OAuthApplication.fetchConsentInfo({ oauthClientId: 'my/client id', scope: 'openid email' });

    expect(fetchSpy).toHaveBeenCalledWith(
      {
        method: 'GET',
        path: '/me/oauth/consent/my%2Fclient%20id',
        search: { scope: 'openid email' },
        sessionId: 'sess_test',
      },
      { skipUpdateClient: true },
    );
  });

  it('omits search when scope is undefined', async () => {
    const fetchSpy = vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: consentPayload,
    } as any);

    BaseResource.clerk = {
      session: { id: 'sess_test' },
    } as any;

    await OAuthApplication.fetchConsentInfo({ oauthClientId: 'cid' });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        search: undefined,
      }),
      { skipUpdateClient: true },
    );
  });

  it('returns OAuthConsentInfo from the FAPI response envelope', async () => {
    vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: consentPayload,
    } as any);

    BaseResource.clerk = {
      session: { id: 'sess_test' },
    } as any;

    const info = await OAuthApplication.fetchConsentInfo({ oauthClientId: 'client_abc' });

    expect(info).toEqual({
      oauth_application_name: 'My App',
      oauth_application_logo_url: 'https://img.example/logo.png',
      oauth_application_url: 'https://app.example',
      client_id: 'client_abc',
      state: 'st',
      scopes: [{ scope: 'openid', description: 'OpenID', requires_consent: true }],
    });
  });

  it('defaults scopes to an empty array when absent', async () => {
    vi.spyOn(BaseResource, '_fetch').mockResolvedValue({
      response: { ...consentPayload, scopes: undefined },
    } as any);

    BaseResource.clerk = {
      session: { id: 'sess_test' },
    } as any;

    const info = await OAuthApplication.fetchConsentInfo({ oauthClientId: 'client_abc' });
    expect(info.scopes).toEqual([]);
  });

  it('maps ClerkAPIResponseError from FAPI on non-2xx', async () => {
    mockFetch(false, 422, {
      errors: [{ code: 'oauth_consent_error', long_message: 'Consent metadata unavailable' }],
    });

    BaseResource.clerk = {
      session: { id: 'sess_1' },
      getFapiClient: () =>
        createFapiClient({
          frontendApi: 'clerk.example.com',
          getSessionId: () => 'sess_1',
          instanceType: 'development' as InstanceType,
        }),
      __internal_setCountry: vi.fn(),
      handleUnauthenticated: vi.fn(),
      __internal_handleUnauthenticatedDevBrowser: vi.fn(),
    } as any;

    await expect(OAuthApplication.fetchConsentInfo({ oauthClientId: 'cid' })).rejects.toSatisfy(
      (err: unknown) => err instanceof ClerkAPIResponseError && err.message === 'Consent metadata unavailable',
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url] = (global.fetch as Mock).mock.calls[0];
    expect(url.toString()).toContain(`/v1/me/oauth/consent/cid`);
    expect(url.toString()).toContain(`__clerk_api_version=${SUPPORTED_FAPI_VERSION}`);
  });

  it('throws ClerkRuntimeError when _fetch returns null (offline)', async () => {
    vi.spyOn(BaseResource, '_fetch').mockResolvedValue(null);

    BaseResource.clerk = {
      session: { id: 'sess_test' },
    } as any;

    await expect(OAuthApplication.fetchConsentInfo({ oauthClientId: 'cid' })).rejects.toMatchObject({
      code: 'network_error',
    });
  });
});
