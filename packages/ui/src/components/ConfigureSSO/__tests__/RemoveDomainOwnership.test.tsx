import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useRemoveDomainDialogController } from '../remove-domain-dialog.controller';

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
  const hook = renderHook(
    () => {
      const card = useCardState();
      return { ...useRemoveDomainDialogController(remove, close, canRun), error: card.error };
    },
    { wrapper },
  );
  return { ...hook, request, remove, close, canRun };
};
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('Domain removal dialog ownership', () => {
  it('starts one removal for two calls before render', async () => {
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

  it('does not close after the dialog unmounts', async () => {
    const { result, request, unmount, close } = await setup();
    const completion = result.current.onSubmit();
    unmount();
    request.resolve();
    await completion;
    expect(close).not.toHaveBeenCalled();
  });

  it('blocks retained submissions after closure', async () => {
    const { result, unmount, remove } = await setup();
    const retained = result.current.onSubmit;
    unmount();
    await retained();
    expect(remove).not.toHaveBeenCalled();
  });

  it('suppresses a late unknown error after closure', async () => {
    const { result, request, unmount, close } = await setup();
    const completion = result.current.onSubmit();
    unmount();
    request.reject(new Error('Earlier failure'));
    await expect(completion).resolves.toBeUndefined();
    expect(close).not.toHaveBeenCalled();
  });

  it('blocks submissions after canonical owner loss without render', async () => {
    const { result, remove, canRun } = await setup();
    canRun.mockReturnValue(false);
    await result.current.onSubmit();
    expect(remove).not.toHaveBeenCalled();
  });

  it('discards a late success after canonical owner loss', async () => {
    const { result, request, close, canRun } = await setup();
    const completion = result.current.onSubmit();
    canRun.mockReturnValue(false);
    request.resolve();
    await completion;
    expect(close).not.toHaveBeenCalled();
  });

  it('discards a late API error after canonical owner loss', async () => {
    const { result, request, canRun } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.onSubmit();
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      request.reject(failure());
      await completion;
    });
    expect(result.current.error).toBeUndefined();
  });

  it('shows a current failure and clears it on a successful retry', async () => {
    const { result, request, remove, close } = await setup();
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.onSubmit();
    });
    await act(async () => {
      request.reject(failure());
      await completion;
    });
    expect(result.current.error).toBeTruthy();
    remove.mockResolvedValueOnce();
    await act(async () => result.current.onSubmit());
    expect(result.current.error).toBeUndefined();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
