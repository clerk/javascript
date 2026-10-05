import { createDeferredPromise } from '@clerk/shared/utils';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SaveError } from '../../../utils/form-error';
import type { UserProfilePictureControllerOptions } from '../user-profile-account-section/user-profile-picture.controller';
import { useUserProfilePictureController } from '../user-profile-account-section/user-profile-picture.controller';

const file = new File(['x'], 'me.png', { type: 'image/png' });

function renderController(options: UserProfilePictureControllerOptions) {
  return renderHook(() => useUserProfilePictureController(options));
}

describe('useUserProfilePictureController', () => {
  // jsdom ships neither half of the object URL API.
  let nextUrl = 0;
  const revoked: string[] = [];

  beforeEach(() => {
    nextUrl = 0;
    revoked.length = 0;
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: () => `blob:preview-${++nextUrl}`,
      revokeObjectURL: (url: string) => revoked.push(url),
    });
  });

  it('leaves out the actions the model did not offer', () => {
    const { result } = renderController({});
    expect(result.current.onChange).toBeUndefined();
    expect(result.current.onRemove).toBeUndefined();
  });

  it('is pending while the upload runs', async () => {
    const upload = createDeferredPromise();
    const onChange = vi.fn(() => upload.promise.then(() => undefined));
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
    expect(result.current.error).toBeUndefined();
  });

  it('ignores a second pick while one is in flight', () => {
    const onChange = vi.fn(() => new Promise<void>(() => {}));
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
      .mockRejectedValueOnce(new SaveError({ global: { code: 'avatar_file_size_exceeded', message: 'Too big.' } }))
      .mockResolvedValueOnce(undefined);
    const { result } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    expect(result.current.error).toEqual({ code: 'avatar_file_size_exceeded', message: 'Too big.' });
    expect(result.current.isPending).toBe(false);

    await act(async () => result.current.onChange?.(file));
    expect(result.current.error).toBeUndefined();
  });

  it('shows the generic error and logs an unexpected throw', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new TypeError('boom');
    const onChange = vi.fn().mockRejectedValue(failure);
    const { result } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    expect(result.current.error).toEqual({ code: 'generic' });
    expect(log).toHaveBeenCalledWith(failure);
    log.mockRestore();
  });

  it('reports a failed removal the same way', async () => {
    const onRemove = vi.fn().mockRejectedValue(new SaveError({ global: { message: 'Nope.' } }));
    const { result } = renderController({ onRemove });

    await act(async () => result.current.onRemove?.());
    expect(result.current.error).toEqual({ message: 'Nope.' });
  });

  it('shows the picked file while the upload is still running', async () => {
    const upload = createDeferredPromise();
    const onChange = vi.fn(() => upload.promise.then(() => undefined));
    const { result } = renderController({ onChange });

    expect(result.current.previewUrl).toBeUndefined();

    act(() => {
      void result.current.onChange?.(file);
    });
    expect(result.current.previewUrl).toBe('blob:preview-1');

    await act(async () => {
      upload.resolve();
      await upload.promise;
    });
    expect(result.current.previewUrl).toBe('blob:preview-1');
  });

  it('drops the preview when the upload fails, so the avatar is never a lie', async () => {
    const upload = createDeferredPromise();
    const onChange = vi.fn(() => upload.promise.then(() => undefined));
    const { result } = renderController({ onChange });

    act(() => {
      void result.current.onChange?.(file);
    });
    expect(result.current.previewUrl).toBe('blob:preview-1');

    await act(async () => {
      upload.reject(new SaveError({ global: { message: 'Nope.' } }));
      await upload.promise.catch(() => undefined);
    });
    expect(result.current.previewUrl).toBeUndefined();
    expect(revoked).toEqual(['blob:preview-1']);
  });

  it('drops the preview once the picture is removed', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const onRemove = vi.fn().mockResolvedValue(undefined);
    const { result } = renderController({ onChange, onRemove });

    await act(async () => result.current.onChange?.(file));
    expect(result.current.previewUrl).toBe('blob:preview-1');

    await act(async () => result.current.onRemove?.());
    expect(result.current.previewUrl).toBeUndefined();
    expect(revoked).toEqual(['blob:preview-1']);
  });

  it('revokes the previous preview when a second pick replaces it', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const { result } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    await act(async () => result.current.onChange?.(new File(['y'], 'other.png', { type: 'image/png' })));

    expect(result.current.previewUrl).toBe('blob:preview-2');
    expect(revoked).toEqual(['blob:preview-1']);
  });

  it('keeps one preview when the same file is picked twice', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const { result } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    await act(async () => result.current.onChange?.(file));

    expect(result.current.previewUrl).toBe('blob:preview-1');
    expect(revoked).toEqual([]);
  });

  it('revokes the preview on unmount', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderController({ onChange });

    await act(async () => result.current.onChange?.(file));
    unmount();

    expect(revoked).toEqual(['blob:preview-1']);
  });
});
