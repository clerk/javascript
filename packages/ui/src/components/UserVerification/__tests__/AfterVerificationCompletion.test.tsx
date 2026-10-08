import type { SessionVerificationResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAfterVerification } from '../use-after-verification';

const state = vi.hoisted(() => ({
  afterVerification: vi.fn(() => Promise.resolve()),
  setCache: vi.fn(),
  setActive: vi.fn(() => Promise.resolve()),
  navigate: vi.fn(() => Promise.resolve()),
}));
vi.mock('@clerk/shared/react', () => ({ useClerk: () => ({ setActive: state.setActive }) }));
vi.mock('../../../contexts', () => ({ useUserVerification: () => ({ afterVerification: state.afterVerification }) }));
vi.mock('../../../hooks/useSupportEmail', () => ({ useSupportEmail: () => 'support@example.com' }));
vi.mock('../../../router', () => ({ useRouter: () => ({ navigate: state.navigate }) }));
vi.mock('../useUserVerificationSession', () => ({ useUserVerificationSession: () => ({ setCache: state.setCache }) }));

const response = { status: 'complete', session: { id: 'session_1' } } as SessionVerificationResource;

beforeEach(() => {
  state.afterVerification = vi.fn(() => Promise.resolve());
  state.setCache = vi.fn();
  state.setActive = vi.fn(() => Promise.resolve());
  state.navigate = vi.fn(() => Promise.resolve());
});

describe('Verification completion', () => {
  it('uses a changed completion callback when routing and SDK callbacks stay stable', async () => {
    const { result, rerender } = renderHook(useAfterVerification);
    const previous = state.afterVerification;
    state.afterVerification = vi.fn(() => Promise.resolve());
    rerender();
    await result.current.handleVerificationResponse(response);
    expect(previous).not.toHaveBeenCalled();
    expect(state.afterVerification).toHaveBeenCalledTimes(1);
  });

  it('updates the current cache writer after render', async () => {
    const { result, rerender } = renderHook(useAfterVerification);
    const previous = state.setCache;
    state.setCache = vi.fn();
    rerender();
    await result.current.handleVerificationResponse(response);
    expect(previous).not.toHaveBeenCalled();
    expect(state.setCache).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ data: response, error: null }));
  });

  it('waits for activation and completes after activation closes the current screen', async () => {
    const activation = createDeferredPromise<void>();
    state.setActive.mockReturnValue(activation.promise);
    const { result, unmount } = renderHook(useAfterVerification);
    const pending = result.current.handleVerificationResponse(response);
    expect(state.setCache).toHaveBeenCalledTimes(1);
    expect(state.setActive).toHaveBeenCalledExactlyOnceWith({ session: 'session_1' });
    expect(state.afterVerification).not.toHaveBeenCalled();
    unmount();
    activation.resolve();
    await pending;
    expect(state.afterVerification).toHaveBeenCalledTimes(1);
  });

  it('does not call the completion callback if activation fails', async () => {
    const error = new Error('Activation failed');
    state.setActive.mockRejectedValue(error);
    const { result } = renderHook(useAfterVerification);
    await expect(result.current.handleVerificationResponse(response)).rejects.toBe(error);
    expect(state.afterVerification).not.toHaveBeenCalled();
  });

  it('routes to the second factor after caching its response', async () => {
    const second = { status: 'needs_second_factor' } as SessionVerificationResource;
    state.navigate.mockImplementation(() => {
      expect(state.setCache).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ data: second }));
      return Promise.resolve();
    });
    const { result } = renderHook(useAfterVerification);
    await result.current.handleVerificationResponse(second);
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith('./factor-two');
    expect(state.setActive).not.toHaveBeenCalled();
    expect(state.afterVerification).not.toHaveBeenCalled();
  });
});
