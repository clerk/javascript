import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { type PropsWithChildren, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useUVCodeController } from '../uv-code-action.controller';

const { createFixtures } = bindCreateFixtures('UserVerification');
const setup = async (prepared = true, strict = false) => {
  const { wrapper: Fixture } = await createFixtures();
  const request = createDeferredPromise<void>();
  const prepare = vi.fn(() => request.promise);
  const onPrepared = vi.fn();
  const canRun = vi.fn(() => true);
  const complete = vi.fn(() => Promise.resolve());
  const attempt = vi.fn(() => Promise.resolve(complete));
  const model = { prepare, attempt, canRun, requestKey: 'factor_1', safeIdentifier: '', profileImageUrl: undefined };
  const Content = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const wrapper = ({ children }: PropsWithChildren) =>
    strict ? (
      <StrictMode>
        <Content>{children}</Content>
      </StrictMode>
    ) : (
      <Content>{children}</Content>
    );
  const hook = renderHook(
    ({ requestKey }) => ({
      ...useUVCodeController({ ...model, requestKey }, prepared, onPrepared),
      card: useCardState(),
    }),
    { wrapper, initialProps: { requestKey: 'factor_1' } },
  );
  return { ...hook, request, prepare, onPrepared, canRun, attempt, complete };
};

const failure = () =>
  new ClerkAPIResponseError('Failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Failed', long_message: 'Please try again' }],
  });

describe('Verification code interaction ownership', () => {
  it('starts only one preparation before render', async () => {
    const { result, prepare, request, onPrepared } = await setup();
    act(() => {
      void result.current.prepare?.();
      void result.current.prepare?.();
    });
    expect(prepare).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(onPrepared).toHaveBeenCalledTimes(1);
  });

  it('clears the card error when the current owner starts preparation', async () => {
    const { result, request } = await setup();
    act(() => result.current.card.setError('Previous failure'));
    expect(result.current.card.error).toBe('Previous failure');
    act(() => {
      void result.current.prepare?.();
    });
    expect(result.current.card.error).toBeUndefined();
    await act(async () => {
      request.resolve();
      await request.promise;
    });
  });

  it('reports a current preparation error and lets the owner retry', async () => {
    const { result, request, prepare, onPrepared } = await setup();
    act(() => {
      void result.current.prepare?.();
    });
    await act(async () => {
      request.reject(failure());
      await request.promise.catch(() => undefined);
    });
    expect(result.current.card.error).toBe('Please try again');
    expect(onPrepared).not.toHaveBeenCalled();
    prepare.mockResolvedValue(undefined);
    await act(async () => {
      await result.current.prepare?.();
    });
    expect(result.current.card.error).toBeUndefined();
    expect(onPrepared).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('does not let a retained preparation clear a new factor error', async () => {
    const { result, rerender, prepare } = await setup();
    const retained = result.current.prepare;
    rerender({ requestKey: 'factor_2' });
    act(() => result.current.card.setError('New factor failure'));
    await act(async () => {
      await retained?.();
    });
    expect(result.current.card.error).toBe('New factor failure');
    expect(prepare).not.toHaveBeenCalled();
  });

  it('keeps preparation pending across a render for the same factor', async () => {
    const { result, rerender, prepare, request, onPrepared } = await setup();
    act(() => {
      void result.current.prepare?.();
    });
    rerender({ requestKey: 'factor_1' });
    act(() => {
      void result.current.prepare?.();
    });
    expect(prepare).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(onPrepared).toHaveBeenCalledTimes(1);
  });

  it('does not report preparation after closure', async () => {
    const { result, request, onPrepared, unmount } = await setup();
    act(() => {
      void result.current.prepare?.();
    });
    unmount();
    request.resolve();
    await request.promise;
    await Promise.resolve();
    expect(onPrepared).not.toHaveBeenCalled();
  });

  it('blocks preparation after canonical ownership changes before render', async () => {
    const { result, prepare, canRun } = await setup();
    canRun.mockReturnValue(false);
    act(() => {
      void result.current.prepare?.();
    });
    expect(prepare).not.toHaveBeenCalled();
  });

  it('discards a late preparation error after source ownership changes', async () => {
    const { result, request, canRun } = await setup();
    act(() => {
      void result.current.prepare?.();
    });
    canRun.mockReturnValue(false);
    await act(async () => {
      request.reject(failure());
      await request.promise.catch(() => undefined);
    });
    expect(result.current.card.error).toBeUndefined();
  });

  it('does not revive retained preparation when an earlier factor returns', async () => {
    const { result, rerender, prepare } = await setup();
    const retained = result.current.prepare;
    rerender({ requestKey: 'factor_2' });
    rerender({ requestKey: 'factor_1' });
    act(() => {
      void retained?.();
    });
    expect(prepare).not.toHaveBeenCalled();
  });

  it('automatically prepares once under Strict Mode', async () => {
    const { request, prepare, onPrepared } = await setup(false, true);
    await waitFor(() => expect(prepare).toHaveBeenCalledTimes(1));
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(onPrepared).toHaveBeenCalledTimes(1);
  });

  it('blocks a retained code action after unmount', async () => {
    const { result, unmount, attempt } = await setup();
    const retained = result.current.action;
    unmount();
    retained(
      '123456',
      () => Promise.resolve(),
      () => Promise.resolve(),
    );
    await Promise.resolve();
    expect(attempt).not.toHaveBeenCalled();
  });

  it('keeps one pending code attempt across renders for the same factor', async () => {
    const { result, attempt, complete, rerender } = await setup();
    const request = createDeferredPromise<() => Promise<void>>();
    attempt.mockReturnValue(request.promise);
    const resolve = vi.fn(() => Promise.resolve());
    const reject = vi.fn(() => Promise.resolve());
    result.current.action('123456', resolve, reject);
    rerender({ requestKey: 'factor_1' });
    result.current.action('123456', resolve, reject);
    expect(attempt).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve(complete);
      await request.promise;
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('does not let an earlier preparation clear a new factor request', async () => {
    const { result, request, prepare, onPrepared, rerender } = await setup();
    const next = createDeferredPromise<void>();
    act(() => {
      void result.current.prepare?.();
    });
    rerender({ requestKey: 'factor_2' });
    prepare.mockReturnValue(next.promise);
    act(() => {
      void result.current.prepare?.();
    });
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    act(() => {
      void result.current.prepare?.();
    });
    expect(prepare).toHaveBeenCalledTimes(2);
    expect(onPrepared).not.toHaveBeenCalled();
    await act(async () => {
      next.resolve();
      await next.promise;
    });
    expect(onPrepared).toHaveBeenCalledTimes(1);
  });

  it('does not complete verification while a field success is pending after owner loss', async () => {
    const { result, canRun, complete } = await setup();
    const field = createDeferredPromise<void>();
    const resolve = vi.fn(() => field.promise);
    result.current.action('123456', resolve, () => Promise.resolve());
    await waitFor(() => expect(resolve).toHaveBeenCalledTimes(1));
    canRun.mockReturnValue(false);
    field.resolve();
    await field.promise;
    await Promise.resolve();
    expect(complete).not.toHaveBeenCalled();
  });
});
