import { createDeferredPromise } from '@clerk/shared/utils';
import { type PropsWithChildren, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useGoogleCredentialsController } from '../google-credentials.controller';

const setup = (options: { strict?: boolean; isConfigured?: boolean } = {}) => {
  const readFile = vi.fn(() => Promise.resolve({ private_key: 'first' }));
  const setCredentials = vi.fn(() => Promise.resolve());
  const canRun = vi.fn(() => true);
  const model = {
    requestKey: 'directory_1',
    canRun,
    readFile,
    setCredentials,
    isConfigured: options.isConfigured ?? false,
    invalidKeyFileMessage: 'Invalid key file',
  };
  const hook = renderHook(({ data }) => useGoogleCredentialsController(data), {
    initialProps: { data: model },
    wrapper: options.strict ? ({ children }: PropsWithChildren) => <StrictMode>{children}</StrictMode> : undefined,
  });
  const stage = async () => {
    await act(async () => {
      await hook.result.current.selectFile(new File(['{}'], 'first.json'));
    });
    act(() => hook.result.current.setSubjectEmail('admin@example.com'));
  };
  return { ...hook, model, readFile, setCredentials, canRun, stage };
};

describe('Google Directory Sync credential lifetime', () => {
  it('supports selection and submission after Strict Mode effect replay', async () => {
    const { result, stage, setCredentials } = setup({ strict: true });
    await stage();
    await act(async () => {
      expect(await result.current.submit()).toBe(true);
    });
    expect(setCredentials).toHaveBeenCalledTimes(1);
  });

  it('permits Continue for a stored credential after Strict Mode replay', async () => {
    const { result, setCredentials } = setup({ strict: true, isConfigured: true });
    expect(await result.current.submit()).toBe(true);
    expect(setCredentials).not.toHaveBeenCalled();
  });

  it('ignores a read started under an earlier directory', async () => {
    const { result, model, rerender, readFile } = setup();
    const first = createDeferredPromise<{ private_key: string }>();
    readFile.mockReturnValueOnce(first.promise);
    const earlier = result.current.selectFile(new File(['{}'], 'first.json'));
    rerender({ data: { ...model, requestKey: 'directory_2' } });
    await act(async () => {
      await result.current.selectFile(new File(['{}'], 'second.json'));
    });
    await act(async () => {
      first.resolve({ private_key: 'old' });
      await earlier;
    });
    expect(result.current.fileName).toBe('second.json');
  });

  it('does not permit Continue after source ownership is lost during submission', async () => {
    const { result, stage, canRun, setCredentials } = setup();
    await stage();
    const deferred = createDeferredPromise<void>();
    setCredentials.mockReturnValueOnce(deferred.promise);
    const completion = result.current.submit();
    canRun.mockReturnValue(false);
    await act(async () => {
      deferred.resolve();
      expect(await completion).toBe(false);
    });
  });

  it('discards an error for a credential that has been replaced', async () => {
    const { result, stage, setCredentials } = setup();
    await stage();
    const deferred = createDeferredPromise<void>();
    setCredentials.mockReturnValueOnce(deferred.promise);
    const completion = result.current.submit();
    await act(async () => {
      await result.current.selectFile(new File(['{}'], 'second.json'));
    });
    deferred.reject(new Error('Earlier credential failed'));
    await expect(completion).resolves.toBe(false);
    expect(result.current.fileName).toBe('second.json');
  });
  it('keeps the newer file when an earlier read completes last', async () => {
    const { result, readFile, setCredentials } = setup();
    const first = createDeferredPromise<{ private_key: string }>();
    readFile.mockReturnValueOnce(first.promise).mockResolvedValueOnce({ private_key: 'second' });
    let earlier!: Promise<void>;
    act(() => {
      earlier = result.current.selectFile(new File(['{}'], 'first.json'));
    });
    await act(async () => {
      await result.current.selectFile(new File(['{}'], 'second.json'));
    });
    await act(async () => {
      first.resolve({ private_key: 'first' });
      await earlier;
    });
    expect(result.current.fileName).toBe('second.json');
    act(() => result.current.setSubjectEmail('admin@example.com'));
    await act(async () => {
      await result.current.submit();
    });
    expect(setCredentials).toHaveBeenCalledWith({
      serviceAccountJson: JSON.stringify({ private_key: 'second' }),
      subjectEmail: 'admin@example.com',
    });
  });

  it('suppresses a failed old read after another file succeeds', async () => {
    const { result, readFile } = setup();
    const first = createDeferredPromise<{ private_key: string }>();
    readFile.mockReturnValueOnce(first.promise);
    const earlier = result.current.selectFile(new File(['{}'], 'first.json'));
    await act(async () => {
      await result.current.selectFile(new File(['{}'], 'second.json'));
    });
    await act(async () => {
      first.reject(new Error('Earlier file failed'));
      await earlier;
    });
    expect(result.current.fileError).toBeNull();
    expect(result.current.fileName).toBe('second.json');
  });

  it('starts only one submit before render', async () => {
    const { result, stage, setCredentials } = setup();
    await stage();
    const deferred = createDeferredPromise<void>();
    setCredentials.mockReturnValueOnce(deferred.promise);
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.submit();
      void result.current.submit();
    });
    expect(setCredentials).toHaveBeenCalledTimes(1);
    await act(async () => {
      deferred.resolve();
      await completion;
    });
  });

  it('does not clear a new file when an earlier submit finishes', async () => {
    const { result, stage, setCredentials, readFile } = setup();
    await stage();
    const deferred = createDeferredPromise<void>();
    setCredentials.mockReturnValueOnce(deferred.promise);
    const completion = result.current.submit();
    readFile.mockResolvedValueOnce({ private_key: 'second' });
    await act(async () => {
      await result.current.selectFile(new File(['{}'], 'second.json'));
    });
    await act(async () => {
      deferred.resolve();
      await completion;
    });
    expect(result.current.fileName).toBe('second.json');
    expect(result.current.canContinue).toBe(true);
  });

  it('clears staged credentials when the directory changes and does not revive them', async () => {
    const { result, stage, model, rerender } = setup();
    await stage();
    const retained = result.current;
    rerender({ data: { ...model, requestKey: 'directory_2' } });
    expect(result.current.fileName).toBeNull();
    expect(result.current.subjectEmail).toBe('');
    expect(result.current.canContinue).toBe(false);
    rerender({ data: model });
    await retained.submit();
    expect(result.current.fileName).toBeNull();
    expect(result.current.canContinue).toBe(false);
  });

  it('blocks retained reads and submission after unmount', async () => {
    const { result, stage, unmount, readFile, setCredentials } = setup();
    await stage();
    const retained = result.current;
    readFile.mockClear();
    unmount();
    await retained.selectFile(new File(['{}'], 'other.json'));
    await retained.submit();
    expect(readFile).not.toHaveBeenCalled();
    expect(setCredentials).not.toHaveBeenCalled();
  });

  it('suppresses a late submission error after unmount', async () => {
    const { result, stage, unmount, setCredentials } = setup();
    await stage();
    const deferred = createDeferredPromise<void>();
    setCredentials.mockReturnValueOnce(deferred.promise);
    const completion = result.current.submit();
    unmount();
    deferred.reject(new Error('Earlier credentials failed'));
    await expect(completion).resolves.toBe(false);
  });

  it('blocks submission when source ownership changes before render', async () => {
    const { result, stage, canRun, setCredentials } = setup();
    await stage();
    canRun.mockReturnValue(false);
    await result.current.submit();
    expect(setCredentials).not.toHaveBeenCalled();
  });

  it('checks current input through a retained submit callback', async () => {
    const { result, stage, setCredentials } = setup();
    await stage();
    const retained = result.current.submit;
    act(() => result.current.setSubjectEmail('wrong'));
    await retained();
    expect(setCredentials).not.toHaveBeenCalled();
  });

  it('propagates a current submission error and keeps the credential for retry', async () => {
    const { result, stage, setCredentials } = setup();
    await stage();
    setCredentials.mockRejectedValueOnce(new Error('Current credentials failed'));
    await expect(result.current.submit()).rejects.toThrow('Current credentials failed');
    expect(result.current.fileName).toBe('first.json');
    await act(async () => {
      await result.current.submit();
    });
    expect(setCredentials).toHaveBeenCalledTimes(2);
    expect(result.current.fileName).toBeNull();
  });
});
