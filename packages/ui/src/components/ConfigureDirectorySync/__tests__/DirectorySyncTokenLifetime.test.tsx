import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';

import type { ConfigureDirectorySyncModel, DirectorySyncToken } from '../configure-directory-sync.types';
import { useConfigureDirectorySyncContextController } from '../configure-directory-sync-context.controller';

const setup = (hasDirectory = true) => {
  const request = createDeferredPromise<DirectorySyncToken | null>();
  const create = vi.fn(() => request.promise);
  const rotate = vi.fn(() => request.promise);
  const canRun = vi.fn(() => true);
  const exit = vi.fn();
  const model: ConfigureDirectorySyncModel = {
    requestKey: 'owner_connection_1',
    directoryKey: hasDirectory ? 'directory_1_epoch_1' : 'no_directory',
    canRun,
    canRunDirectory: canRun,
    isLoading: false,
    enterpriseConnectionId: 'connection_1',
    connection: undefined,
    provider: undefined,
    providerMeta: undefined,
    directory: hasDirectory
      ? {
          id: 'directory_1',
          endpointUrl: 'https://example.com/scim',
          attributeMapping: {},
          credentialsConfigured: false,
        }
      : null,
    createDirectory: create,
    rotateToken: rotate,
    setDirectoryEnabled: vi.fn(() => Promise.resolve()),
    setCredentials: vi.fn(() => Promise.resolve()),
    syncDirectory: vi.fn(() => Promise.resolve()),
  };
  const hook = renderHook(({ data }) => useConfigureDirectorySyncContextController(data, exit), {
    initialProps: { data: model },
  });
  return { ...hook, model, request, create, rotate, canRun, exit };
};
const token = { enterpriseConnectionId: 'connection_1', directoryId: 'directory_1', token: 'secret' };

describe('Directory Sync revealed token lifetime', () => {
  it('does not revive a pending rotation after its directory changes and returns', async () => {
    const { result, request, model, rerender } = setup();
    const pending = result.current.rotateToken();
    rerender({
      data: { ...model, directoryKey: 'directory_2_epoch_2', directory: { ...model.directory!, id: 'directory_2' } },
    });
    rerender({ data: model });
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    expect(result.current.revealedToken).toBeNull();
  });

  it('suppresses a rotation error after its directory changes', async () => {
    const { result, request, model, rerender } = setup();
    const pending = result.current.rotateToken();
    rerender({
      data: { ...model, directoryKey: 'directory_2_epoch_2', directory: { ...model.directory!, id: 'directory_2' } },
    });
    request.reject(new Error('Earlier directory failed'));
    await expect(pending).resolves.toBeUndefined();
  });
  it('clears the revealed token when the directory changes under the same connection', async () => {
    const { result, request, model, rerender } = setup();
    const pending = result.current.rotateToken();
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    expect(result.current.revealedToken).toBe('secret');
    rerender({
      data: { ...model, directoryKey: 'directory_2_epoch_2', directory: { ...model.directory!, id: 'directory_2' } },
    });
    expect(result.current.revealedToken).toBeNull();
    rerender({ data: model });
    expect(result.current.revealedToken).toBeNull();
  });

  it('does not revive a revealed token after its directory disappears and returns', async () => {
    const { result, request, model, rerender } = setup();
    const pending = result.current.rotateToken();
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    rerender({ data: { ...model, directoryKey: 'no_directory_epoch_2', directory: null } });
    expect(result.current.revealedToken).toBeNull();
    rerender({ data: model });
    expect(result.current.revealedToken).toBeNull();
  });

  it('discards an earlier response after its directory is replaced', async () => {
    const { result, request, model, rerender } = setup();
    const pending = result.current.rotateToken();
    rerender({
      data: { ...model, directoryKey: 'directory_2_epoch_2', directory: { ...model.directory!, id: 'directory_2' } },
    });
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    expect(result.current.revealedToken).toBeNull();
    rerender({ data: model });
    expect(result.current.revealedToken).toBeNull();
  });

  it('keeps the token when data changes for the same directory', async () => {
    const { result, request, model, rerender } = setup();
    const pending = result.current.rotateToken();
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    rerender({
      data: { ...model, directory: { ...model.directory!, attributeMapping: { firstName: 'name.givenName' } } },
    });
    expect(result.current.revealedToken).toBe('secret');
  });

  it('waits for a created directory before revealing its token', async () => {
    const { result, request, model, rerender } = setup(false);
    const pending = result.current.createDirectory();
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    expect(result.current.revealedToken).toBeNull();
    rerender({
      data: {
        ...model,
        directoryKey: 'directory_1_epoch_2',
        directory: {
          id: 'directory_1',
          endpointUrl: 'https://example.com/scim',
          attributeMapping: {},
          credentialsConfigured: false,
        },
      },
    });
    expect(result.current.revealedToken).toBe('secret');
  });
  it('blocks token commands when the source loses ownership before render', async () => {
    const { result, canRun, create, rotate } = setup();
    canRun.mockReturnValue(false);
    await result.current.createDirectory();
    await result.current.rotateToken();
    expect(create).not.toHaveBeenCalled();
    expect(rotate).not.toHaveBeenCalled();
  });

  it('does not reveal a token after source ownership is lost', async () => {
    const { result, canRun, request } = setup();
    const pending = result.current.createDirectory();
    canRun.mockReturnValue(false);
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    expect(result.current.revealedToken).toBeNull();
  });

  it('discards a pending token when the wizard exits', async () => {
    const { result, request, exit } = setup();
    const pending = result.current.createDirectory();
    act(() => result.current.onExit?.());
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    expect(exit).toHaveBeenCalledTimes(1);
    expect(result.current.revealedToken).toBeNull();
  });
  it('starts only one token request before render', async () => {
    const { result, request, create, rotate } = setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.createDirectory();
      void result.current.rotateToken();
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(rotate).not.toHaveBeenCalled();
    await act(async () => {
      request.resolve(token);
      await completion;
    });
    expect(result.current.revealedToken).toBe('secret');
  });

  it('blocks retained token commands after unmount', async () => {
    const { result, unmount, create, rotate } = setup();
    const retained = result.current;
    unmount();
    await retained.createDirectory();
    await retained.rotateToken();
    expect(create).not.toHaveBeenCalled();
    expect(rotate).not.toHaveBeenCalled();
  });

  it('suppresses a late unknown error after closure', async () => {
    const { result, unmount, request } = setup();
    const pending = result.current.createDirectory();
    unmount();
    request.reject(new Error('Earlier token failed'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('does not revive a pending token when an earlier connection returns', async () => {
    const { result, model, rerender, request } = setup();
    const pending = result.current.createDirectory();
    rerender({ data: { ...model, enterpriseConnectionId: 'connection_2' } });
    await act(async () => {
      request.resolve(token);
      await pending;
    });
    rerender({ data: model });
    expect(result.current.revealedToken).toBeNull();
  });

  it('discards a token response for another connection', async () => {
    const { result, request } = setup();
    const pending = result.current.createDirectory();
    await act(async () => {
      request.resolve({ ...token, enterpriseConnectionId: 'connection_2' });
      await pending;
    });
    expect(result.current.revealedToken).toBeNull();
  });

  it('propagates a current error and permits retry', async () => {
    const { result, request, create } = setup();
    const pending = result.current.createDirectory();
    request.reject(new Error('Current token failed'));
    await expect(pending).rejects.toThrow('Current token failed');
    create.mockResolvedValueOnce(token);
    await act(async () => {
      await result.current.createDirectory();
    });
    expect(result.current.revealedToken).toBe('secret');
  });
  it('disposes commands before the exit callback runs', async () => {
    const { result, model, create, rotate, exit, request } = setup();
    const retained = result.current;
    exit.mockImplementation(() => {
      expect(retained.canRun()).toBe(false);
      expect(retained.canRunDirectory()).toBe(false);
      void retained.createDirectory();
      void retained.rotateToken();
      void retained.syncDirectory();
    });
    act(() => {
      retained.onExit?.();
    });
    expect(create).not.toHaveBeenCalled();
    expect(rotate).not.toHaveBeenCalled();
    expect(model.syncDirectory).not.toHaveBeenCalled();
    await act(async () => {
      request.resolve(token);
      await request.promise;
    });
  });

  it('calls exit only once and does not revive commands after a render', async () => {
    const { result, model, rerender, exit } = setup();
    const retained = result.current;
    act(() => {
      retained.onExit?.();
      retained.onExit?.();
    });
    rerender({ data: { ...model } });
    await result.current.setDirectoryEnabled(true);
    await result.current.setCredentials({ serviceAccountJson: '{}', subjectEmail: 'admin@example.com' });
    await result.current.syncDirectory();
    expect(exit).toHaveBeenCalledTimes(1);
    expect(result.current.canRun()).toBe(false);
    expect(model.setDirectoryEnabled).not.toHaveBeenCalled();
    expect(model.setCredentials).not.toHaveBeenCalled();
    expect(model.syncDirectory).not.toHaveBeenCalled();
  });

  it('blocks direct commands after unmount', async () => {
    const { result, model, unmount } = setup();
    const retained = result.current;
    unmount();
    await retained.setDirectoryEnabled(true);
    await retained.setCredentials({ serviceAccountJson: '{}', subjectEmail: 'admin@example.com' });
    await retained.syncDirectory();
    expect(model.setDirectoryEnabled).not.toHaveBeenCalled();
    expect(model.setCredentials).not.toHaveBeenCalled();
    expect(model.syncDirectory).not.toHaveBeenCalled();
  });

  it('blocks direct commands after canonical source ownership is lost', async () => {
    const { result, model, canRun } = setup();
    canRun.mockReturnValue(false);
    await result.current.setDirectoryEnabled(true);
    await result.current.setCredentials({ serviceAccountJson: '{}', subjectEmail: 'admin@example.com' });
    await result.current.syncDirectory();
    expect(model.setDirectoryEnabled).not.toHaveBeenCalled();
    expect(model.setCredentials).not.toHaveBeenCalled();
    expect(model.syncDirectory).not.toHaveBeenCalled();
  });

  it('blocks retained directory commands when an earlier directory returns', async () => {
    const { result, model, rerender, rotate, request } = setup();
    const retained = result.current;
    rerender({ data: { ...model, directoryKey: 'directory_2' } });
    rerender({ data: model });
    void retained.rotateToken();
    await retained.setDirectoryEnabled(true);
    await retained.setCredentials({ serviceAccountJson: '{}', subjectEmail: 'admin@example.com' });
    await retained.syncDirectory();
    expect(rotate).not.toHaveBeenCalled();
    expect(model.setDirectoryEnabled).not.toHaveBeenCalled();
    expect(model.setCredentials).not.toHaveBeenCalled();
    expect(model.syncDirectory).not.toHaveBeenCalled();
    await act(async () => {
      request.resolve(token);
      await request.promise;
    });
  });

  it('suppresses a direct command error after synchronous closure', async () => {
    const { result, model } = setup();
    const request = createDeferredPromise<void>();
    vi.mocked(model.syncDirectory).mockReturnValueOnce(request.promise);
    const pending = result.current.syncDirectory();
    act(() => {
      result.current.onExit?.();
    });
    request.reject(new Error('Earlier sync failed'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('propagates current direct command errors and permits retry', async () => {
    const { result, model } = setup();
    vi.mocked(model.syncDirectory).mockRejectedValueOnce(new Error('Current sync failed'));
    await expect(result.current.syncDirectory()).rejects.toThrow('Current sync failed');
    await expect(result.current.syncDirectory()).resolves.toBeUndefined();
    expect(model.syncDirectory).toHaveBeenCalledTimes(2);
  });

  it('permits commands for a new connection after the earlier connection closes', async () => {
    const { result, model, rerender } = setup();
    act(() => {
      result.current.onExit?.();
    });
    rerender({ data: { ...model, requestKey: 'owner_connection_2', enterpriseConnectionId: 'connection_2' } });
    expect(result.current.canRun()).toBe(true);
    await result.current.syncDirectory();
    expect(model.syncDirectory).toHaveBeenCalledTimes(1);
  });
  it('starts a current rotation while an earlier directory rotation is still pending', async () => {
    const { result, model, rerender, rotate, request } = setup();
    const earlier = result.current.rotateToken();
    const current = createDeferredPromise<DirectorySyncToken | null>();
    rotate.mockReturnValueOnce(current.promise);
    rerender({
      data: { ...model, directoryKey: 'directory_2_epoch', directory: { ...model.directory!, id: 'directory_2' } },
    });
    const completion = result.current.rotateToken();
    expect(rotate).toHaveBeenCalledTimes(2);
    await act(async () => {
      request.resolve(token);
      await earlier;
    });
    expect(result.current.revealedToken).toBeNull();
    await act(async () => {
      current.resolve({ ...token, directoryId: 'directory_2', token: 'current_secret' });
      await completion;
    });
    expect(result.current.revealedToken).toBe('current_secret');
  });
});
