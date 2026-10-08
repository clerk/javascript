import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useConfiguredDirectorySyncController } from '../security-directory-sync.controller';

const { createFixtures } = bindCreateFixtures('ConfigureDirectorySync');
const setup = async () => {
  const { wrapper: Fixture } = await createFixtures();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const request = createDeferredPromise<void>();
  const update = vi.fn(() => request.promise);
  const remove = vi.fn(() => Promise.resolve());
  const configure = vi.fn();
  const canRun = vi.fn(() => true);
  const hook = renderHook(
    ({ requestKey }) => ({
      controller: useConfiguredDirectorySyncController(
        { requestKey, canRun, status: 'active', updateEnabled: update, onDelete: remove },
        'Acme',
        { current: null },
        configure,
      ),
      card: useCardState(),
    }),
    { wrapper, initialProps: { requestKey: 'directory_1' } },
  );
  return { ...hook, request, update, remove, configure, canRun };
};

describe('Directory Sync request ownership', () => {
  it('blocks actions when the source loses ownership before render', async () => {
    const { result, canRun, update, remove, configure } = await setup();
    canRun.mockReturnValue(false);
    await result.current.controller.updateEnabled(false);
    await result.current.controller.onDelete();
    result.current.controller.onConfigure();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(configure).not.toHaveBeenCalled();
  });

  it('suppresses an error after source ownership is lost and releases loading', async () => {
    const { result, canRun, request } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.controller.updateEnabled(false);
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      request.reject(new Error('Earlier owner failed'));
      await expect(completion).resolves.toBeUndefined();
    });
    expect(result.current.card.isLoading).toBe(false);
  });
  it('starts only one update before render', async () => {
    const { result, update, request } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.controller.updateEnabled(false);
      void result.current.controller.updateEnabled(false);
    });
    expect(update).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await completion;
    });
    expect(result.current.card.isLoading).toBe(false);
  });

  it('blocks retained commands after unmount', async () => {
    const { result, unmount, update, remove, configure } = await setup();
    update.mockResolvedValueOnce();
    const retained = result.current.controller;
    unmount();
    await retained.updateEnabled(false);
    await retained.onDelete();
    retained.onConfigure();
    retained.openRemoveDialog();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(configure).not.toHaveBeenCalled();
  });

  it('suppresses an unknown rejection after unmount', async () => {
    const { result, unmount, request } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.controller.updateEnabled(false);
    });
    unmount();
    request.reject(new Error('Earlier update failed'));
    await expect(completion).resolves.toBeUndefined();
  });

  it('releases its loading state on target change without clearing a later request', async () => {
    const { result, rerender, update, request } = await setup();
    let earlier!: Promise<void>;
    act(() => {
      earlier = result.current.controller.updateEnabled(false);
    });
    rerender({ requestKey: 'directory_2' });
    expect(result.current.card.isLoading).toBe(false);
    const current = createDeferredPromise<void>();
    update.mockReturnValueOnce(current.promise);
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.controller.updateEnabled(true);
    });
    await act(async () => {
      request.resolve();
      await earlier;
    });
    expect(result.current.card.isLoading).toBe(true);
    await act(async () => {
      current.resolve();
      await completion;
    });
    expect(result.current.card.isLoading).toBe(false);
  });

  it('does not revive old commands when an earlier target returns', async () => {
    const { result, rerender, update, remove, configure } = await setup();
    update.mockResolvedValueOnce();
    const retained = result.current.controller;
    rerender({ requestKey: 'directory_2' });
    rerender({ requestKey: 'directory_1' });
    await retained.updateEnabled(false);
    await retained.onDelete();
    retained.onConfigure();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(configure).not.toHaveBeenCalled();
  });

  it('clears the remove dialog when its target changes', async () => {
    const { result, rerender } = await setup();
    act(() => result.current.controller.openRemoveDialog());
    expect(result.current.controller.isRemoveDialogOpen).toBe(true);
    rerender({ requestKey: 'directory_2' });
    expect(result.current.controller.isRemoveDialogOpen).toBe(false);
  });

  it('keeps current unknown errors visible to the caller and permits retry', async () => {
    const { result, update, request } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.controller.updateEnabled(false);
    });
    await act(async () => {
      request.reject(new Error('Current update failed'));
      await expect(completion).rejects.toThrow('Current update failed');
    });
    expect(result.current.card.isLoading).toBe(false);
    update.mockResolvedValueOnce();
    await act(async () => {
      await result.current.controller.updateEnabled(false);
    });
    expect(update).toHaveBeenCalledTimes(2);
  });
});
