import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { clerkApiError } from '../../../__tests__/clerk-errors';
import { MosaicProvider } from '../../../mosaic-provider';
import { useUserProfilePasskeysSectionController } from './user-profile-passkeys-section.controller';

function renderController(onAdd: () => Promise<void>) {
  return renderHook(
    () =>
      useUserProfilePasskeysSectionController({
        passkeys: [],
        onAdd,
        onRename: async () => {},
        validateName: () => undefined,
        onRemove: async () => {},
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MosaicProvider localization={{ overrides: { 'errors.action_blocked': 'Action refusée.' } }}>
          {children}
        </MosaicProvider>
      ),
    },
  );
}

describe('useUserProfilePasskeysSectionController', () => {
  it('keeps one Add action pending and clears its error on retry', async () => {
    const pending = deferred<void>();
    const onAdd = vi.fn(() => pending.promise);
    const { result } = renderController(onAdd);

    act(() => {
      result.current.onAdd?.();
      result.current.onAdd?.();
    });

    expect(onAdd).toHaveBeenCalledOnce();
    expect(result.current.isAdding).toBe(true);

    await act(async () => {
      pending.reject(clerkApiError('action_blocked', 'Raw server sentence.'));
      await pending.promise.catch(() => {});
    });

    await waitFor(() => expect(result.current.addError).toBe('Action refusée.'));
    expect(result.current.isAdding).toBe(false);

    const retry = deferred<void>();
    onAdd.mockImplementation(() => retry.promise);
    act(() => result.current.onAdd?.());

    expect(result.current.addError).toBeUndefined();
    expect(result.current.isAdding).toBe(true);
    await act(async () => {
      retry.resolve();
      await retry.promise;
    });
    await waitFor(() => expect(result.current.isAdding).toBe(false));
    expect(result.current.addError).toBeUndefined();
    expect(onAdd).toHaveBeenCalledTimes(2);
  });

  it('shows a localized error when Add throws before returning a promise', async () => {
    const { result } = renderController(() => {
      throw clerkApiError('action_blocked', 'Raw server sentence.');
    });

    act(() => result.current.onAdd?.());

    await waitFor(() => expect(result.current.addError).toBe('Action refusée.'));
    expect(result.current.isAdding).toBe(false);
  });
});
