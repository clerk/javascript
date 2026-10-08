import type { SessionVerificationResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { type PropsWithChildren, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';

import { UserVerificationSessionProvider, useUserVerificationSession } from '../user-verification-session.model';

const { createFixtures } = bindCreateFixtures('UserVerification');
const first = {
  status: 'needs_first_factor',
  supportedFirstFactors: [{ strategy: 'password' }],
} as SessionVerificationResource;
const second = {
  status: 'needs_second_factor',
  supportedSecondFactors: [{ strategy: 'totp' }],
} as SessionVerificationResource;

const setup = async (strict = false) => {
  const {
    wrapper: Fixture,
    fixtures,
    props,
  } = await createFixtures(f => {
    f.withUser({ username: 'clerkuser' });
  });
  const start = vi.spyOn(fixtures.session, 'startVerification');
  const Content = ({ children }: PropsWithChildren) => (
    <Fixture>
      <UserVerificationSessionProvider>{children}</UserVerificationSessionProvider>
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
  return { wrapper, fixtures, props, start };
};

describe('Verification session ownership', () => {
  it('does not read a previous session snapshot when the active session changes', async () => {
    const { wrapper, fixtures, start } = await setup();
    start.mockResolvedValue(first);
    const { result, rerender } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_first_factor'));
    const request = createDeferredPromise<SessionVerificationResource>();
    const nextStart = vi.fn(() => request.promise);
    const session = { ...fixtures.session, id: 'session_2', startVerification: nextStart };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session as never);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      session: session as never,
    };
    rerender();
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(nextStart).toHaveBeenCalledTimes(1));
    await act(async () => {
      request.resolve(second);
      await request.promise;
    });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_second_factor'));
  });

  it('shares one start request across consumers in the same flow', async () => {
    const { wrapper, start } = await setup();
    start.mockResolvedValue(first);
    const { result } = renderHook(() => [useUserVerificationSession(), useUserVerificationSession()], { wrapper });
    await waitFor(() => expect(result.current[0].data?.status).toBe('needs_first_factor'));
    expect(result.current[1].data?.status).toBe('needs_first_factor');
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('keeps a completed snapshot when the same session object is refreshed', async () => {
    const { wrapper, fixtures, start } = await setup();
    start.mockResolvedValue(first);
    const { result, rerender } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_first_factor'));
    const nextStart = vi.fn(() => Promise.resolve(second));
    const session = { ...fixtures.session, startVerification: nextStart };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session as never);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources,
      session: session as never,
    };
    rerender();
    await act(async () => {
      await Promise.resolve();
    });
    expect(nextStart).not.toHaveBeenCalled();
    expect(result.current.data?.status).toBe('needs_first_factor');
  });

  it('starts only one SDK request under Strict Mode', async () => {
    const { wrapper, start } = await setup(true);
    start.mockResolvedValue(first);
    const { result } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_first_factor'));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('keeps two open flows separate even when they use the same session', async () => {
    const { wrapper, start } = await setup();
    const a = createDeferredPromise<SessionVerificationResource>();
    const b = createDeferredPromise<SessionVerificationResource>();
    start.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const firstFlow = renderHook(useUserVerificationSession, { wrapper });
    const secondFlow = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledTimes(2));
    await act(async () => {
      a.resolve(first);
      b.resolve(second);
      await Promise.all([a.promise, b.promise]);
    });
    await waitFor(() => {
      expect(firstFlow.result.current.data?.status).toBe('needs_first_factor');
      expect(secondFlow.result.current.data?.status).toBe('needs_second_factor');
    });
  });

  it('does not let an earlier request error settle a newer retry', async () => {
    const { wrapper, start } = await setup();
    const earlier = createDeferredPromise<SessionVerificationResource>();
    const current = createDeferredPromise<SessionVerificationResource>();
    start.mockReturnValueOnce(earlier.promise).mockReturnValueOnce(current.promise);
    const { result } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    act(() => result.current.revalidate());
    await waitFor(() => expect(start).toHaveBeenCalledTimes(2));
    await act(async () => {
      earlier.reject(new Error('Previous request failed'));
      await earlier.promise.catch(() => undefined);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isValidating).toBe(true);
    await act(async () => {
      current.resolve(second);
      await current.promise;
    });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_second_factor'));
  });

  it('reports current errors and lets the owner retry', async () => {
    const { wrapper, start } = await setup();
    const error = new Error('Verification unavailable');
    start.mockRejectedValueOnce(error).mockResolvedValueOnce(first);
    const { result } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.isLoading).toBe(false);
    act(() => result.current.revalidate());
    await waitFor(() => expect(result.current.data?.status).toBe('needs_first_factor'));
    expect(result.current.error).toBeNull();
    expect(start).toHaveBeenCalledTimes(2);
  });

  it('starts a separate request when the requested verification level changes', async () => {
    const { wrapper, start, props } = await setup();
    start.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const { result, rerender } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_first_factor'));
    expect(start).toHaveBeenNthCalledWith(1, { level: 'second_factor' });
    props.setProps({ level: 'first_factor' });
    rerender();
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(result.current.data?.status).toBe('needs_second_factor'));
    expect(start).toHaveBeenNthCalledWith(2, { level: 'first_factor' });
  });

  it('blocks retained retry and cache commands after the flow closes', async () => {
    const { wrapper, start } = await setup();
    start.mockResolvedValue(first);
    const { result, unmount } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_first_factor'));
    const retained = result.current;
    unmount();
    act(() => {
      retained.revalidate();
      retained.setCache({ data: second, error: null, isLoading: false, isValidating: false });
    });
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('ignores a late SDK error after the source account changes', async () => {
    const { wrapper, fixtures, start } = await setup();
    const request = createDeferredPromise<SessionVerificationResource>();
    start.mockReturnValue(request.promise);
    const { result } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user, id: 'other' } as never);
    await act(async () => {
      request.reject(new Error('Late failure'));
      await request.promise.catch(() => undefined);
    });
    expect(result.current.error).toBeNull();
  });

  it('starts a fresh request after the flow closes and ignores the earlier result', async () => {
    const { wrapper, start } = await setup();
    const earlier = createDeferredPromise<SessionVerificationResource>();
    const current = createDeferredPromise<SessionVerificationResource>();
    start.mockReturnValueOnce(earlier.promise).mockReturnValueOnce(current.promise);
    const previous = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    previous.unmount();
    const { result } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledTimes(2));
    await act(async () => {
      current.resolve(second);
      earlier.resolve(first);
      await Promise.all([current.promise, earlier.promise]);
    });
    await waitFor(() => expect(result.current.data?.status).toBe('needs_second_factor'));
  });

  it('does not let an initial request overwrite a verification attempt response', async () => {
    const { wrapper, start } = await setup();
    const request = createDeferredPromise<SessionVerificationResource>();
    start.mockReturnValue(request.promise);
    const { result } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    act(() =>
      result.current.setCache({
        data: second,
        error: null,
        isLoading: false,
        isValidating: false,
        cachedAt: Date.now(),
      }),
    );
    await act(async () => {
      request.resolve(first);
      await request.promise;
      await new Promise(resolve => setTimeout(resolve, 400));
    });
    expect(result.current.data?.status).toBe('needs_second_factor');
  });

  it('does not publish a throttled result after canonical session ownership changes before render', async () => {
    const { wrapper, fixtures, start } = await setup();
    start.mockResolvedValue(first);
    const { result } = renderHook(useUserVerificationSession, { wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.session, id: 'session_2' } as never);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });
    expect(result.current.data).toBeNull();
  });
});
