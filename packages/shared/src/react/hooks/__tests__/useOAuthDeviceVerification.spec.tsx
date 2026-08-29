import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OAuthDeviceVerificationInfo, OAuthDeviceVerificationResult } from '@/types';

import { useOAuthDeviceVerification } from '../useOAuthDeviceVerification';
import { createMockClerk } from './mocks/clerk';
import { wrapper } from './wrapper';

const verificationInfo: OAuthDeviceVerificationInfo = {
  oauthApplicationName: 'TV App',
  oauthApplicationLogoUrl: null,
  clientId: 'client_device',
  scopes: [],
  status: 'pending',
  expiresAt: 1_800_000_000_000,
};

const approvedResult: OAuthDeviceVerificationResult = { object: 'oauth_device_verification', status: 'approved' };
const lookupDeviceVerification = vi.fn(() => Promise.resolve(verificationInfo));
const submitDeviceVerification = vi.fn<() => Promise<OAuthDeviceVerificationResult>>(() =>
  Promise.resolve(approvedResult),
);
const mockClerk = createMockClerk({
  oauthApplication: { lookupDeviceVerification, submitDeviceVerification },
});

vi.mock('../../contexts', () => ({
  useAssertWrappedByClerkProvider: () => {},
  useClerkInstanceContext: () => mockClerk,
}));

describe('useOAuthDeviceVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClerk.loaded = true;
    mockClerk.oauthApplication = { lookupDeviceVerification, submitDeviceVerification };
  });

  it('does not make a request until an action is called', () => {
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(lookupDeviceVerification).not.toHaveBeenCalled();
    expect(submitDeviceVerification).not.toHaveBeenCalled();
  });

  it('looks up verification information once and stores it', async () => {
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    await act(() => result.current.lookup({ userCode: 'bcdf ghjk' }));

    expect(lookupDeviceVerification).toHaveBeenCalledOnce();
    expect(lookupDeviceVerification).toHaveBeenCalledWith({ userCode: 'BCDFGHJK' });
    expect(result.current.data).toEqual(verificationInfo);
    expect(result.current.error).toBeNull();
  });

  it('submits approve and deny decisions with the expected bodies', async () => {
    submitDeviceVerification
      .mockResolvedValueOnce(approvedResult)
      .mockResolvedValueOnce({ object: 'oauth_device_verification', status: 'denied' });
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    await act(() => result.current.approve({ userCode: 'bcdf ghjk', organizationId: 'org_123' }));
    expect(submitDeviceVerification).toHaveBeenLastCalledWith({
      userCode: 'BCDFGHJK',
      organizationId: 'org_123',
      approved: true,
    });

    await act(() => result.current.deny({ userCode: 'BCDF-GHJK' }));
    expect(submitDeviceVerification).toHaveBeenLastCalledWith({ userCode: 'BCDFGHJK', approved: false });
    expect(result.current.result?.status).toBe('denied');
  });

  it('coalesces concurrent lookups for equivalent normalized codes', async () => {
    let resolveLookup!: (value: typeof verificationInfo) => void;
    lookupDeviceVerification.mockImplementationOnce(() => new Promise(resolve => (resolveLookup = resolve)));
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let first!: Promise<typeof verificationInfo>;
    let second!: Promise<typeof verificationInfo>;
    act(() => {
      first = result.current.lookup({ userCode: 'BCDF-GHJK' });
      second = result.current.lookup({ userCode: 'bcdf ghjk' });
    });

    expect(first).toBe(second);
    expect(lookupDeviceVerification).toHaveBeenCalledOnce();
    resolveLookup(verificationInfo);
    await act(() => first);
  });

  it('rejects a distinct lookup while another code is pending', async () => {
    let resolveLookup!: (value: typeof verificationInfo) => void;
    lookupDeviceVerification.mockImplementationOnce(() => new Promise(resolve => (resolveLookup = resolve)));
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let first!: Promise<typeof verificationInfo>;
    act(() => {
      first = result.current.lookup({ userCode: 'BCDF-GHJK' });
    });

    const second = result.current.lookup({ userCode: 'JKLM-NPQR' });
    await expect(second).rejects.toMatchObject({ code: 'oauth_device_verification_lookup_in_progress' });
    expect(lookupDeviceVerification).toHaveBeenCalledOnce();
    expect(result.current.isLoading).toBe(true);

    resolveLookup(verificationInfo);
    await act(() => first);
    expect(result.current.data).toEqual(verificationInfo);
  });

  it('rejects a pre-load lookup without leaving loading state stuck and succeeds after Clerk loads', async () => {
    mockClerk.loaded = false;
    mockClerk.oauthApplication = undefined;
    const { result, rerender } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let request!: Promise<typeof verificationInfo>;
    expect(() => {
      request = result.current.lookup({ userCode: 'BCDF-GHJK' });
    }).not.toThrow();
    await expect(request).rejects.toMatchObject({ code: 'oauth_device_verification_not_ready' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeNull();

    mockClerk.loaded = true;
    mockClerk.oauthApplication = { lookupDeviceVerification, submitDeviceVerification };
    rerender();
    await act(() => result.current.lookup({ userCode: 'BCDF-GHJK' }));

    expect(lookupDeviceVerification).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(verificationInfo);
  });

  it('rejects a pre-load decision without entering submitting state', async () => {
    mockClerk.loaded = false;
    mockClerk.oauthApplication = undefined;
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    const request = result.current.approve({ userCode: 'BCDF-GHJK' });
    await expect(request).rejects.toMatchObject({ code: 'oauth_device_verification_not_ready' });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(submitDeviceVerification).not.toHaveBeenCalled();
  });

  it('coalesces concurrent equivalent decisions', async () => {
    let resolveSubmit!: (value: OAuthDeviceVerificationResult) => void;
    submitDeviceVerification.mockImplementationOnce(() => new Promise(resolve => (resolveSubmit = resolve)));
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let first!: Promise<OAuthDeviceVerificationResult>;
    let second!: Promise<OAuthDeviceVerificationResult>;
    act(() => {
      first = result.current.approve({ userCode: 'BCDF-GHJK', organizationId: 'org_123' });
      second = result.current.approve({ userCode: 'bcdf ghjk', organizationId: 'org_123' });
    });

    expect(first).toBe(second);
    expect(submitDeviceVerification).toHaveBeenCalledOnce();
    expect(submitDeviceVerification).toHaveBeenCalledWith({
      userCode: 'BCDFGHJK',
      organizationId: 'org_123',
      approved: true,
    });
    resolveSubmit(approvedResult);
    await act(() => first);
  });

  it('rejects a conflicting decision while another decision is pending', async () => {
    let resolveSubmit!: (value: OAuthDeviceVerificationResult) => void;
    submitDeviceVerification.mockImplementationOnce(() => new Promise(resolve => (resolveSubmit = resolve)));
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let first!: Promise<OAuthDeviceVerificationResult>;
    act(() => {
      first = result.current.approve({ userCode: 'BCDF-GHJK' });
    });

    const second = result.current.deny({ userCode: 'BCDF-GHJK' });
    await expect(second).rejects.toMatchObject({ code: 'oauth_device_verification_submission_in_progress' });
    expect(submitDeviceVerification).toHaveBeenCalledOnce();
    expect(result.current.isSubmitting).toBe(true);

    resolveSubmit(approvedResult);
    await act(() => first);
    expect(result.current.result).toEqual(approvedResult);
  });

  it('stores and rethrows an action error without retrying', async () => {
    const error = new Error('lookup failed');
    lookupDeviceVerification.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.lookup({ userCode: 'BCDF-GHJK' });
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBe(error);
    expect(lookupDeviceVerification).toHaveBeenCalledOnce();
    expect(result.current.error).toBe(error);
  });

  it('reset clears state and ignores a pending response', async () => {
    let resolveLookup!: (value: typeof verificationInfo) => void;
    lookupDeviceVerification.mockImplementationOnce(() => new Promise(resolve => (resolveLookup = resolve)));
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let request!: Promise<typeof verificationInfo>;
    act(() => {
      request = result.current.lookup({ userCode: 'BCDF-GHJK' });
    });
    act(() => result.current.reset());
    resolveLookup(verificationInfo);
    await act(() => request);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('reset keeps a pending decision locked until its request settles', async () => {
    let resolveSubmit!: (value: OAuthDeviceVerificationResult) => void;
    submitDeviceVerification.mockImplementationOnce(() => new Promise(resolve => (resolveSubmit = resolve)));
    const { result } = renderHook(() => useOAuthDeviceVerification(), { wrapper });

    let first!: Promise<OAuthDeviceVerificationResult>;
    act(() => {
      first = result.current.approve({ userCode: 'BCDF-GHJK' });
    });
    act(() => result.current.reset());

    const second = result.current.deny({ userCode: 'BCDF-GHJK' });
    await expect(second).rejects.toMatchObject({ code: 'oauth_device_verification_submission_in_progress' });
    expect(submitDeviceVerification).toHaveBeenCalledOnce();

    resolveSubmit(approvedResult);
    await act(() => first);
    await act(() => result.current.deny({ userCode: 'BCDF-GHJK' }));
    expect(submitDeviceVerification).toHaveBeenCalledTimes(2);
  });
});
