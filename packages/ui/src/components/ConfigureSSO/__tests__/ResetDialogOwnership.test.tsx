import { createDeferredPromise } from '@clerk/shared/utils';
import type { ChangeEvent, PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { useResetConnectionDialogController } from '../reset-connection-dialog.controller';

const { createFixtures } = bindCreateFixtures('ConfigureSSO');
const setup = async () => {
  const { wrapper: Fixture } = await createFixtures();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const request = createDeferredPromise<void>();
  const remove = vi.fn(() => request.promise);
  const close = vi.fn();
  const canRun = vi.fn(() => true);
  const hook = renderHook(() => useResetConnectionDialogController('Acme', remove, close, canRun), { wrapper });
  act(() =>
    hook.result.current.confirmationFieldProps.onChange({ target: { value: 'Acme' } } as ChangeEvent<HTMLInputElement>),
  );
  return { ...hook, request, remove, close, canRun };
};

describe('Reset dialog request ownership', () => {
  it('blocks confirmed deletion when its source loses ownership before render', async () => {
    const { result, canRun, remove } = await setup();
    canRun.mockReturnValue(false);
    await result.current.onSubmit();
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not close when a pending deletion loses source ownership', async () => {
    const { result, canRun, request, close } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.onSubmit();
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      request.resolve();
      await completion;
    });
    expect(close).not.toHaveBeenCalled();
  });
  it('starts only one confirmed deletion before render', async () => {
    const { result, request, remove, close } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.onSubmit();
      void result.current.onSubmit();
    });
    expect(remove).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await completion;
    });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('does not close after a pending deletion finishes after unmount', async () => {
    const { result, request, unmount, close } = await setup();
    const completion = result.current.onSubmit();
    unmount();
    request.resolve();
    await completion;
    expect(close).not.toHaveBeenCalled();
  });

  it('blocks a retained confirmed callback after closure', async () => {
    const { result, unmount, remove } = await setup();
    const retained = result.current.onSubmit;
    unmount();
    void retained();
    expect(remove).not.toHaveBeenCalled();
  });

  it('suppresses a late unknown rejection after closure', async () => {
    const { result, request, unmount } = await setup();
    const completion = result.current.onSubmit();
    unmount();
    request.reject(new Error('Earlier reset failed'));
    await expect(completion).resolves.toBeUndefined();
  });

  it('checks current confirmation when an earlier submit callback is retained', async () => {
    const { result, remove } = await setup();
    const retained = result.current.onSubmit;
    act(() =>
      result.current.confirmationFieldProps.onChange({ target: { value: 'wrong' } } as ChangeEvent<HTMLInputElement>),
    );
    void retained();
    expect(remove).not.toHaveBeenCalled();
  });
});
