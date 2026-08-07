import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOAuthConsent } from '../useOAuthConsent';
import { createMockClerk, createMockQueryClient, createMockUser } from './mocks/clerk';
import { wrapper } from './wrapper';

const consentInfo = {
  oauthApplicationName: 'My App',
  oauthApplicationLogoUrl: 'https://img.example/logo.png',
  oauthApplicationUrl: 'https://app.example',
  clientId: 'client_abc',
  state: 's',
  scopes: [] as { scope: string; description: string | null; requiresConsent: boolean }[],
};

const getConsentInfoSpy = vi.fn(() => Promise.resolve(consentInfo));

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  oauthApplication: {
    getConsentInfo: getConsentInfoSpy,
  },
  queryClient: defaultQueryClient,
});

const userState: { current: { id: string } | null } = {
  current: createMockUser(),
};

vi.mock('../../contexts', () => {
  return {
    useAssertWrappedByClerkProvider: () => {},
    useClerkInstanceContext: () => mockClerk,
    useInitialStateContext: () => undefined,
  };
});

vi.mock('../base/useUserBase', () => ({
  useUserBase: () => userState.current,
}));

describe('useOAuthConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultQueryClient.client.clear();
    mockClerk.loaded = true;
    userState.current = createMockUser();
    mockClerk.oauthApplication = {
      getConsentInfo: getConsentInfoSpy,
    };
  });

  it('fetches consent metadata when signed in', async () => {
    const { result } = renderHook(() => useOAuthConsent({ oauthClientId: 'my_client' }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getConsentInfoSpy).toHaveBeenCalledTimes(1);
    expect(getConsentInfoSpy).toHaveBeenCalledWith({ oauthClientId: 'my_client' });
    expect(result.current.data).toEqual(consentInfo);
    expect(result.current.error).toBeNull();
  });

  it('passes scope to getConsentInfo when provided', async () => {
    const { result } = renderHook(() => useOAuthConsent({ oauthClientId: 'cid', scope: 'openid email' }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getConsentInfoSpy).toHaveBeenCalledWith({ oauthClientId: 'cid', scope: 'openid email' });
    expect(result.current.data).toEqual(consentInfo);
  });

  it('does not call getConsentInfo when user is null', () => {
    userState.current = null;

    const { result } = renderHook(() => useOAuthConsent({ oauthClientId: 'cid' }), { wrapper });

    expect(getConsentInfoSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not call getConsentInfo when clerk.loaded is false', () => {
    mockClerk.loaded = false;

    const { result } = renderHook(() => useOAuthConsent({ oauthClientId: 'cid' }), { wrapper });

    expect(getConsentInfoSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not call getConsentInfo when enabled is false', () => {
    const { result } = renderHook(() => useOAuthConsent({ oauthClientId: 'cid', enabled: false }), { wrapper });

    expect(getConsentInfoSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not call getConsentInfo when oauthClientId is empty', () => {
    const { result } = renderHook(() => useOAuthConsent({ oauthClientId: '' }), { wrapper });

    expect(getConsentInfoSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
