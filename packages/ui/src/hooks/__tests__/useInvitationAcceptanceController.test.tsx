import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInvitationAcceptanceController } from '../useInvitationAcceptanceController';

const { setError, beginRequest, releaseRequest } = vi.hoisted(() => ({
  setError: vi.fn(),
  beginRequest: vi.fn(),
  releaseRequest: vi.fn(),
}));

vi.mock('@/ui/elements/contexts', () => ({
  useCardState: () => ({
    isLoading: false,
    setError,
    beginRequest,
  }),
}));

vi.mock('@/ui/utils/errorHandler', () => ({
  handleError: (error: unknown, _fields: unknown[], setError: (error: unknown) => void) => setError(error),
}));

describe('useInvitationAcceptanceController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    beginRequest.mockReturnValue(releaseRequest);
  });

  it('shares one pending request across repeated acceptance clicks', async () => {
    const organization = { id: 'org_123' };
    let resolve: ((value: typeof organization) => void) | undefined;
    const accept = vi.fn(() => new Promise<typeof organization>(done => (resolve = done)));
    const { result } = renderHook(() => useInvitationAcceptanceController(accept));
    let pending: Promise<void> | undefined;

    act(() => {
      pending = result.current.onAccept();
      expect(result.current.onAccept()).toBe(pending);
    });
    expect(accept).toHaveBeenCalledOnce();
    expect(result.current.state.status).toBe('pending');

    await act(async () => {
      resolve?.(organization);
      await pending;
    });
    expect(result.current.state).toEqual({ status: 'accepted', value: organization });
  });

  it('reports a failed request and permits a retry', async () => {
    const error = new Error('Unable to accept invitation');
    const accept = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('accepted');
    const { result } = renderHook(() => useInvitationAcceptanceController(accept));

    await act(async () => {
      await result.current.onAccept();
    });
    expect(setError).toHaveBeenCalledWith(error);
    expect(result.current.state.status).toBe('idle');

    await act(async () => {
      await result.current.onAccept();
    });
    expect(accept).toHaveBeenCalledTimes(2);
    expect(result.current.state).toEqual({ status: 'accepted', value: 'accepted' });
  });
  it('clears loading after a synchronous failure and permits a retry', async () => {
    const error = new Error('Synchronous acceptance failure');
    const accept = vi
      .fn()
      .mockImplementationOnce(() => {
        throw error;
      })
      .mockResolvedValueOnce('accepted');
    const { result } = renderHook(() => useInvitationAcceptanceController(accept));
    await act(async () => {
      await result.current.onAccept();
    });
    expect(setError).toHaveBeenCalledWith(error);
    expect(releaseRequest).toHaveBeenCalledOnce();
    expect(result.current.state.status).toBe('idle');
    await act(async () => {
      await result.current.onAccept();
    });
    expect(accept).toHaveBeenCalledTimes(2);
    expect(result.current.state).toEqual({ status: 'accepted', value: 'accepted' });
  });
});
