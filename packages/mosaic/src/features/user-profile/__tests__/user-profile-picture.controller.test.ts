import { createDeferredPromise } from '@clerk/shared/utils';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { UserProfileSaveResult } from '../user-profile-account-section/user-profile-account-section.types';
import type { UserProfilePictureControllerOptions } from '../user-profile-account-section/user-profile-picture.controller';
import { useUserProfilePictureController } from '../user-profile-account-section/user-profile-picture.controller';

const file = new File(['x'], 'me.png', { type: 'image/png' });

function renderController(options: UserProfilePictureControllerOptions) {
  return renderHook(() => useUserProfilePictureController(options));
}

describe('useUserProfilePictureController', () => {
  it('leaves out the actions the model did not offer', () => {
    const { result } = renderController({});
    expect(result.current.onChange).toBeUndefined();
    expect(result.current.onRemove).toBeUndefined();
  });

  it('is pending while the upload runs', async () => {
    const upload = createDeferredPromise();
    const onChange = vi.fn(() => upload.promise.then(() => ({ error: null })));
    const { result } = renderController({ onChange });

    act(() => {
      void result.current.onChange?.(file);
    });
    expect(result.current.isPending).toBe(true);
    expect(onChange).toHaveBeenCalledWith(file);

    await act(async () => {
      upload.resolve();
      await upload.promise;
    });
    expect(result.current.isPending).toBe(false);
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('ignores a second pick while one is in flight', () => {
    const onChange = vi.fn(() => new Promise<UserProfileSaveResult>(() => {}));
    const { result } = renderController({ onChange });

    act(() => {
      void result.current.onChange?.(file);
    });
    act(() => {
      void result.current.onChange?.(file);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows why the upload failed, and clears it on the next attempt', async () => {
    const onChange = vi
      .fn()
      .mockResolvedValueOnce({ error: { kind: 'form', message: 'Too big.' } })
      .mockResolvedValueOnce({ error: null });
    const { result } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    expect(result.current.errorMessage).toBe('Too big.');
    expect(result.current.isPending).toBe(false);

    await act(async () => result.current.onChange?.(file));
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('shows nothing when the action is cancelled', async () => {
    const onChange = vi.fn().mockResolvedValue({ error: { kind: 'cancelled' } });
    const { result } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    expect(result.current.errorMessage).toBeUndefined();
  });

  it('shows the message of an unexpected throw', async () => {
    const onChange = vi.fn().mockRejectedValue(new Error('Network down.'));
    const { result } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    expect(result.current.errorMessage).toBe('Network down.');
  });

  it('reports a failed removal the same way', async () => {
    const onRemove = vi.fn().mockResolvedValue({ error: { kind: 'form', message: 'Nope.' } });
    const { result } = renderController({ onRemove });

    await act(async () => result.current.onRemove?.());
    expect(result.current.errorMessage).toBe('Nope.');
  });
});
