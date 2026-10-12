import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { useUserProfileSolanaWalletsModel } from '../user-profile-solana-wallet.model';

afterEach(() => {
  vi.doUnmock('@wallet-standard/core');
});

describe('Solana wallet discovery failures', () => {
  it('handles a registry import that rejects after unmount', async () => {
    const load = deferred<never>();
    const unhandled = vi.fn();
    window.addEventListener('unhandledrejection', unhandled);
    const loadRegistry = vi.fn(() => load.promise);
    vi.doMock('@wallet-standard/core', loadRegistry);

    try {
      const { result, unmount } = renderHook(useUserProfileSolanaWalletsModel);
      expect(result.current).toEqual({ status: 'loading' });
      await waitFor(() => expect(loadRegistry).toHaveBeenCalledOnce());
      unmount();
      await act(async () => {
        load.reject(new Error('Registry import failed after unmount'));
        await vi.dynamicImportSettled();
      });
      expect(result.current).toEqual({ status: 'loading' });
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('unhandledrejection', unhandled);
    }
  });

  it('reports a failed registry import instead of an empty wallet list', async () => {
    vi.doMock('@wallet-standard/core', () => {
      throw new Error('Failed to fetch the wallet registry chunk');
    });

    const { result } = renderHook(useUserProfileSolanaWalletsModel);
    expect(result.current).toEqual({ status: 'loading' });
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(result.current).toMatchObject({ status: 'error' });
  });
});
