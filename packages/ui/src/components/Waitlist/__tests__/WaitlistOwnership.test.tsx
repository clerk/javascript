import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { FormEvent, PropsWithChildren } from 'react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { Waitlist } from '..';
import { useWaitlistController } from '../waitlist.controller';
import { useWaitlistModel } from '../waitlist.model';

const state = vi.hoisted(() => ({
  email: 'initial@clerk.com',
  redirect: undefined as string | undefined,
  navigate: vi.fn(),
}));

vi.mock('../../../contexts', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../contexts')>();
  return {
    ...actual,
    useWaitlistContext: () => ({
      ...actual.useWaitlistContext(),
      initialValues: { emailAddress: state.email },
      afterJoinWaitlistUrl: state.redirect,
    }),
  };
});

vi.mock('../../../router', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../router')>();
  return { ...actual, useRouter: () => ({ ...actual.useRouter(), navigate: state.navigate }) };
});

const { createFixtures } = bindCreateFixtures('Waitlist');
const event = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent<HTMLFormElement>;
const failure = () =>
  new ClerkAPIResponseError('Join failed', { data: [{ code: 'waitlist_error', message: 'Join failed' }], status: 422 });

async function createWrapper(strict = false) {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
    f.withWaitlistMode();
  });
  fixtures.clerk.joinWaitlist.mockResolvedValue({ id: 'waitlist_1', reload: vi.fn() } as never);
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{strict ? <StrictMode>{children}</StrictMode> : children}</CardStateProvider>
    </Fixture>
  );
  return { wrapper, fixtures };
}

async function setup(strict = false) {
  const { wrapper, fixtures } = await createWrapper(strict);
  const hook = renderHook(
    () => ({ model: useWaitlistModel(), controller: useWaitlistController(useWaitlistModel()), card: useCardState() }),
    { wrapper },
  );
  return { ...hook, fixtures };
}

beforeEach(() => {
  state.email = 'initial@clerk.com';
  state.redirect = undefined;
  state.navigate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Waitlist request ownership', () => {
  it('returns a completion flag and discards the SDK resource', async () => {
    const { result, fixtures } = await setup();
    await expect(result.current.model.join('hello@clerk.com')).resolves.toBe(true);
    expect(fixtures.clerk.joinWaitlist).toHaveBeenCalledExactlyOnceWith({ emailAddress: 'hello@clerk.com' });
    expect(result.current.model).not.toHaveProperty('resource');
  });

  it('does not dispatch for an inactive caller and ignores a result after caller cancellation', async () => {
    const { result, fixtures } = await setup();
    await expect(result.current.model.join('hello@clerk.com', () => false)).resolves.toBe(false);
    expect(fixtures.clerk.joinWaitlist).not.toHaveBeenCalled();
    const request = createDeferredPromise();
    fixtures.clerk.joinWaitlist.mockReturnValueOnce(request.promise as never);
    let current = true;
    const pending = result.current.model.join('hello@clerk.com', () => current);
    current = false;
    request.resolve({ id: 'old_resource' });
    await expect(pending).resolves.toBe(false);
  });

  it.each(['user', 'session', 'client'] as const)('blocks retained commands after canonical %s drift', async source => {
    state.redirect = '/after';
    const { result, fixtures } = await setup();
    const retained = result.current.model;
    vi.spyOn(fixtures.clerk, source, 'get').mockReturnValue({
      ...fixtures.clerk[source],
      id: `${source}_new`,
    } as never);
    await expect(retained.join('hello@clerk.com')).resolves.toBe(false);
    retained.navigateAfterJoin();
    expect(fixtures.clerk.joinWaitlist).not.toHaveBeenCalled();
    expect(state.navigate).not.toHaveBeenCalled();
  });

  it('blocks model and controller commands after unmount', async () => {
    state.redirect = '/after';
    const { result, fixtures, unmount } = await setup();
    const retained = result.current;
    unmount();
    await expect(retained.model.join('hello@clerk.com')).resolves.toBe(false);
    await retained.controller.onSubmit(event());
    retained.model.navigateAfterJoin();
    expect(fixtures.clerk.joinWaitlist).not.toHaveBeenCalled();
    expect(state.navigate).not.toHaveBeenCalled();
  });

  it('shares one pending submission across repeated calls and renders', async () => {
    const request = createDeferredPromise();
    const { result, fixtures, rerender } = await setup();
    fixtures.clerk.joinWaitlist.mockReturnValueOnce(request.promise as never);
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.controller.onSubmit(event());
      second = result.current.controller.onSubmit(event());
    });
    expect(first).toBe(second);
    rerender();
    act(() => {
      second = result.current.controller.onSubmit(event());
    });
    expect(second).toBe(first);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.clerk.joinWaitlist).toHaveBeenCalledOnce();
    await act(async () => {
      request.resolve({ id: 'waitlist_1' });
      await first;
    });
    expect(result.current.controller.step).toBe(1);
    await act(() => result.current.controller.onSubmit(event()));
    expect(fixtures.clerk.joinWaitlist).toHaveBeenCalledOnce();
  });

  it('cancels dispatch when the controller unmounts before its queued command runs', async () => {
    const { result, fixtures, unmount } = await setup();
    const pending = result.current.controller.onSubmit(event());
    unmount();
    await pending;
    expect(fixtures.clerk.joinWaitlist).not.toHaveBeenCalled();
  });

  it.each(['success', 'error'] as const)('ignores late %s after the request source changes', async outcome => {
    state.redirect = '/old';
    const request = createDeferredPromise();
    const { result, fixtures, rerender } = await setup();
    vi.useFakeTimers();
    fixtures.clerk.joinWaitlist.mockReturnValueOnce(request.promise as never);
    const retained = result.current.controller;
    let pending!: Promise<void>;
    await act(async () => {
      pending = retained.onSubmit(event());
      await Promise.resolve();
    });
    state.redirect = '/new';
    rerender();
    act(() => result.current.card.setError('Current error'));
    await act(async () => {
      if (outcome === 'success') {
        request.resolve({ id: 'old_waitlist' });
      } else {
        request.reject(failure());
      }
      await pending;
      await retained.onSubmit(event());
    });
    expect(result.current.controller.step).toBe(0);
    expect(result.current.controller.error).toBe('Current error');
    expect(vi.getTimerCount()).toBe(0);
    expect(state.navigate).not.toHaveBeenCalled();
    expect(fixtures.clerk.joinWaitlist).toHaveBeenCalledOnce();
  });

  it('keeps errors current and permits retry after a failed join', async () => {
    state.redirect = '/after';
    const { result, fixtures } = await setup();
    vi.useFakeTimers();
    fixtures.clerk.joinWaitlist.mockRejectedValueOnce(failure());
    await act(() => result.current.controller.onSubmit(event()));
    expect(result.current.controller.error).toBe('Join failed');
    expect(result.current.controller.step).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    await act(() => result.current.controller.onSubmit(event()));
    expect(result.current.controller.error).toBeUndefined();
    expect(result.current.controller.step).toBe(1);
    expect(vi.getTimerCount()).toBe(1);
    expect(fixtures.clerk.joinWaitlist).toHaveBeenCalledTimes(2);
  });

  it('does not revive an old command when its configuration returns', async () => {
    state.redirect = '/first';
    const { result, fixtures, rerender } = await setup();
    const retained = result.current.controller;
    state.redirect = '/second';
    rerender();
    state.redirect = '/first';
    rerender();
    await act(() => retained.onSubmit(event()));
    expect(fixtures.clerk.joinWaitlist).not.toHaveBeenCalled();
  });
});

describe('Waitlist navigation ownership', () => {
  it.each([false, true])('navigates once after the delay, StrictMode=%s', async strict => {
    state.redirect = '/after';
    const { result, fixtures } = await setup(strict);
    vi.useFakeTimers();
    await act(() => result.current.controller.onSubmit(event()));
    expect(result.current.controller.step).toBe(1);
    expect(vi.getTimerCount()).toBe(1);
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(state.navigate).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith('/after');
    expect(vi.getTimerCount()).toBe(0);
    await act(() => result.current.controller.onSubmit(event()));
    expect(fixtures.clerk.joinWaitlist).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('allocates no navigation timer without a destination', async () => {
    const { result } = await setup();
    vi.useFakeTimers();
    await act(() => result.current.controller.onSubmit(event()));
    expect(result.current.controller.step).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the timer on unmount and blocks an already queued callback', async () => {
    state.redirect = '/after';
    const { result, unmount } = await setup();
    vi.useFakeTimers();
    const schedule = vi.spyOn(window, 'setTimeout');
    await act(() => result.current.controller.onSubmit(event()));
    const callback = schedule.mock.calls.find(([, delay]) => delay === 2000)![0] as () => void;
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    callback();
    expect(state.navigate).not.toHaveBeenCalled();
  });

  it('clears the timer and success state when the destination changes', async () => {
    state.redirect = '/old';
    const { result, rerender } = await setup();
    vi.useFakeTimers();
    await act(() => result.current.controller.onSubmit(event()));
    state.redirect = '/new';
    rerender();
    expect(vi.getTimerCount()).toBe(0);
    expect(result.current.controller.step).toBe(0);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(state.navigate).not.toHaveBeenCalled();
    await act(() => result.current.controller.onSubmit(event()));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith('/new');
  });

  it.each(['user', 'session', 'client'] as const)(
    'blocks delayed navigation after canonical %s drift',
    async source => {
      state.redirect = '/after';
      const { result, fixtures } = await setup();
      vi.useFakeTimers();
      await act(() => result.current.controller.onSubmit(event()));
      vi.spyOn(fixtures.clerk, source, 'get').mockReturnValue({
        ...fixtures.clerk[source],
        id: `${source}_new`,
      } as never);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(state.navigate).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('uses the latest router command for the same request source', async () => {
    state.redirect = '/after';
    const { result, rerender } = await setup();
    vi.useFakeTimers();
    await act(() => result.current.controller.onSubmit(event()));
    const previous = state.navigate;
    state.navigate = vi.fn().mockResolvedValue(undefined);
    rerender();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(previous).not.toHaveBeenCalled();
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith('/after');
  });
});

describe('Waitlist form ownership', () => {
  it('releases the old form request and keeps a replacement form busy when the old result arrives', async () => {
    const { wrapper, fixtures } = await createWrapper();
    const old = createDeferredPromise();
    const next = createDeferredPromise();
    fixtures.clerk.joinWaitlist.mockReturnValueOnce(old.promise as never).mockReturnValueOnce(next.promise as never);
    const { getByRole, rerender, userEvent, getByText } = render(<Waitlist />, { wrapper });
    const previous = getByRole('button', { name: 'Join the waitlist' });
    await userEvent.click(previous);
    expect(previous).toBeDisabled();
    state.email = 'replacement@clerk.com';
    rerender(<Waitlist />);
    const button = getByRole('button', { name: 'Join the waitlist' });
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    await act(async () => {
      old.resolve({ id: 'old_waitlist' });
      await old.promise;
    });
    expect(button).toBeDisabled();
    await act(async () => {
      next.resolve({ id: 'new_waitlist' });
      await next.promise;
    });
    expect(getByText('Thanks for joining the waitlist!')).toBeVisible();
    expect(fixtures.clerk.joinWaitlist.mock.calls.map(([input]) => input.emailAddress)).toEqual([
      'initial@clerk.com',
      'replacement@clerk.com',
    ]);
  });

  it('resets the success screen and initial field value when configuration changes', async () => {
    const { wrapper } = await createWrapper();
    const { getByRole, getByText, getByLabelText, rerender, userEvent } = render(<Waitlist />, { wrapper });
    await userEvent.click(getByRole('button', { name: 'Join the waitlist' }));
    expect(getByText('Thanks for joining the waitlist!')).toBeVisible();
    state.email = 'new@clerk.com';
    rerender(<Waitlist />);
    expect(getByLabelText(/email address/i)).toHaveValue('new@clerk.com');
    expect(getByRole('button', { name: 'Join the waitlist' })).not.toBeDisabled();
  });
});
