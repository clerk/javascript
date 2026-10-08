import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource, SignUpResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { FormEvent, PropsWithChildren } from 'react';
import { StrictMode, useLayoutEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useSignInStartController } from '../sign-in-start.controller';
import { useSignInStartModel } from '../sign-in-start.model';
import type { SignInStartModel, SignInStartRecovery } from '../sign-in-start.types';

const { createFixtures } = bindCreateFixtures('SignIn');
const complete = { status: 'complete', createdSessionId: 'session_result' } as SignInResource;
const fields = [{ id: 'identifier', value: 'user@example.com', type: 'text' }];
const identifier = { type: 'text', value: 'user@example.com' };
const apiError = (code: string) =>
  new ClerkAPIResponseError('Sign-in failure', {
    data: [{ code, message: 'Sign-in failure', long_message: 'Sign-in failure' }],
    status: 400,
  });

describe.each(['submit', 'ticket'] as const)('Sign-in start %s ownership', method => {
  const setup = async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => f.withEmailAddress());
    props.setProps({ forceRedirectUrl: '/done' });
    const request = createDeferredPromise<SignInResource>();
    fixtures.signIn.create.mockReturnValue(request.promise);
    const hook = renderHook(useSignInStartModel, { wrapper });
    const command = () =>
      method === 'submit' ? hook.result.current.submit(fields, {}) : hook.result.current.createTicketSignIn('ticket');
    return { ...hook, command, fixtures, request };
  };

  it('blocks a command after closure', async () => {
    const { command, unmount, fixtures } = await setup();
    unmount();
    await command();
    expect(fixtures.signIn.create).not.toHaveBeenCalled();
  });

  it.each(['client', 'user', 'session', 'organization'] as const)(
    'blocks a command after canonical %s changes before render',
    async field => {
      const { command, fixtures } = await setup();
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await command();
      expect(fixtures.signIn.create).not.toHaveBeenCalled();
    },
  );

  it.each(['complete', 'needs_protect_check', 'needs_second_factor'] as const)(
    'discards a late %s result after closure',
    async status => {
      const { command, request, unmount, fixtures } = await setup();
      const pending = command();
      unmount();
      request.resolve({ ...complete, status } as SignInResource);
      await pending;
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it('discards a late result when the account changes before render', async () => {
    const { command, request, fixtures } = await setup();
    const pending = command();
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ id: 'other_session' } as never);
    request.resolve(complete);
    await pending;
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('suppresses a stale SDK error and preserves a current error', async () => {
    const { command, request, fixtures, unmount } = await setup();
    const currentError = apiError('form_identifier_not_found');
    fixtures.signIn.create.mockRejectedValueOnce(currentError);
    await expect(command()).rejects.toBe(currentError);
    const pending = command();
    unmount();
    request.reject(apiError('session_exists'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('accepts an attempt ID assigned by creation', async () => {
    const { command, request, fixtures } = await setup();
    const pending = command();
    fixtures.signIn.id = 'new_attempt';
    request.resolve(complete);
    await pending;
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'session_result' }));
  });

  it('finishes a valid activation redirect after account change and closure', async () => {
    const { command, request, fixtures, unmount } = await setup();
    const activation = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockImplementation(async options => {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ id: 'session_result' } as never);
      await activation.promise;
      await options?.navigate?.({
        session: { id: 'session_result', currentTask: null } as never,
        decorateUrl: url => url,
      });
    });
    const pending = command();
    request.resolve(complete);
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    unmount();
    activation.resolve();
    await pending;
    expect(fixtures.router.navigate).toHaveBeenCalledWith(new URL('/done', window.location.href).href);
  });
});

describe('Sign-in start continuation ownership', () => {
  it('does not start the enterprise password fallback after closure', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEnterpriseSso());
    const request = createDeferredPromise<SignInResource>();
    const attempt = vi.fn();
    fixtures.signIn.create.mockReturnValue(request.promise);
    const { result, unmount } = renderHook(useSignInStartModel, { wrapper });
    const pending = result.current.submit([...fields, { id: 'password', name: 'password', value: 'secret' }], {});
    unmount();
    request.resolve({
      status: 'needs_first_factor',
      supportedFirstFactors: [{ strategy: 'password' }],
      attemptFirstFactor: attempt,
    } as unknown as SignInResource);
    await pending;
    expect(attempt).not.toHaveBeenCalled();
  });

  it('discards a password fallback result after canonical ownership changes', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withEnterpriseSso());
    const request = createDeferredPromise<SignInResource>();
    const attempt = vi.fn(() => request.promise);
    fixtures.signIn.create.mockResolvedValue({
      status: 'needs_first_factor',
      supportedFirstFactors: [{ strategy: 'password' }],
      attemptFirstFactor: attempt,
    } as unknown as SignInResource);
    const { result } = renderHook(useSignInStartModel, { wrapper });
    const pending = result.current.submit([...fields, { id: 'password', name: 'password', value: 'secret' }], {});
    await waitFor(() => expect(attempt).toHaveBeenCalledOnce());
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ id: 'other_user' } as never);
    request.resolve(complete);
    await pending;
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('blocks retained recovery and reset commands after closure', async () => {
    const { wrapper, fixtures } = await createFixtures();
    const { result, unmount } = renderHook(useSignInStartModel, { wrapper });
    unmount();
    expect(await result.current.recoverSignInError(apiError('session_exists'), identifier)).toBe('ignored');
    await result.current.clearFirstFactorError();
    await result.current.navigateToTicketSignUp(new URLSearchParams());
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.signIn.create).not.toHaveBeenCalled();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it.each(['close', 'signUp replacement'] as const)('discards a combined-flow result after %s', async change => {
    const { wrapper, fixtures, props } = await createFixtures(f => f.withEmailAddress());
    props.setProps({ withSignUp: true });
    fixtures.signUp.optionalFields = [];
    const request = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValue(request.promise);
    const { result, unmount } = renderHook(useSignInStartModel, { wrapper });
    const pending = result.current.recoverSignInError(apiError('form_identifier_not_found'), identifier);
    expect(fixtures.signUp.create).toHaveBeenCalledOnce();
    if (change === 'close') {
      unmount();
    } else {
      vi.spyOn(fixtures.clerk.client, 'signUp', 'get').mockReturnValue({ id: 'other_sign_up' } as never);
    }
    request.resolve({ status: 'complete', createdSessionId: 'signup_session' } as SignUpResource);
    await pending;
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });
});

describe('Sign-in start controller ownership', () => {
  const setup = async ({ strict = false, ticket = 'ticket', holdCard = false, oauthError = false } = {}) => {
    const { wrapper: Fixture } = await createFixtures(f => f.withEmailAddress());
    let releaseExternal: (() => void) | undefined;
    const Blocker = () => {
      const card = useCardState();
      const latest = useRef(card);
      latest.current = card;
      useLayoutEffect(() => {
        if (holdCard) {
          releaseExternal = latest.current.beginRequest();
        }
      }, []);
      return null;
    };
    const wrapper = ({ children }: PropsWithChildren) => {
      const content = (
        <Fixture>
          <CardStateProvider>
            <Blocker />
            {children}
          </CardStateProvider>
        </Fixture>
      );
      return strict ? <StrictMode>{content}</StrictMode> : content;
    };
    const request = createDeferredPromise<void>();
    const create = vi.fn(() => request.promise);
    const recovery = vi.fn((): Promise<SignInStartRecovery> => Promise.resolve('unhandled'));
    const submit = vi.fn<SignInStartModel['submit']>(() => Promise.resolve());
    const redirecting = vi.fn(() => false);
    const canRun = vi.fn(() => true);
    const clear = vi.fn((): Promise<void> => Promise.resolve());
    const firstError = vi.fn<SignInStartModel['getFirstFactorError']>(() =>
      oauthError ? { kind: 'api_error', error: apiError('oauth_access_denied').errors[0] } : undefined,
    );
    const hook = renderHook(
      ({ requestKey }) => {
        const model = useSignInStartModel();
        const controller = useSignInStartController({
          ...model,
          requestKey,
          canRun,
          organizationTicket: ticket,
          createTicketSignIn: create,
          recoverSignInError: recovery,
          submit,
          isRedirectingToSSOProvider: redirecting,
          clearFirstFactorError: clear,
          getFirstFactorError: firstError,
        });
        return { controller, card: useCardState() };
      },
      { wrapper, initialProps: { requestKey: 'source_1' } },
    );
    return {
      ...hook,
      request,
      create,
      recovery,
      submit,
      redirecting,
      canRun,
      clear,
      firstError,
      releaseExternal: () => releaseExternal?.(),
    };
  };

  it('starts a ticket once under Strict Mode and keeps its request across renders', async () => {
    const { create, rerender, result, request } = await setup({ strict: true });
    await waitFor(() => expect(create).toHaveBeenCalledExactlyOnceWith('ticket'));
    rerender({ requestKey: 'source_1' });
    expect(create).toHaveBeenCalledOnce();
    expect(result.current.controller.kind).toBe('loading');
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(result.current.card.isLoading).toBe(false);
    expect(result.current.controller.kind).toBe('form');
  });

  it('waits for another Card request before it starts a ticket', async () => {
    const { create, releaseExternal, request } = await setup({ holdCard: true });
    await act(() => Promise.resolve());
    expect(create).not.toHaveBeenCalled();
    act(releaseExternal);
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    await act(async () => {
      request.resolve();
      await request.promise;
    });
  });

  it('releases its lease on closure without releasing a newer Card request', async () => {
    const { create, result, rerender, request, canRun } = await setup();
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    canRun.mockReturnValue(false);
    rerender({ requestKey: 'source_2' });
    expect(result.current.card.isLoading).toBe(false);
    let release: (() => void) | undefined;
    act(() => {
      release = result.current.card.beginRequest();
    });
    expect(release).toBeTypeOf('function');
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(result.current.card.isLoading).toBe(true);
    act(() => release?.());
  });

  it('does not recover a stale ticket error or clear the new ticket loading state', async () => {
    const { create, result, rerender, request, recovery } = await setup();
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    const next = createDeferredPromise<void>();
    create.mockReturnValue(next.promise);
    rerender({ requestKey: 'source_2' });
    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    await act(async () => {
      request.reject(apiError('session_exists'));
      await request.promise.catch(() => undefined);
    });
    expect(recovery).not.toHaveBeenCalled();
    expect(result.current.card.isLoading).toBe(true);
    expect(result.current.controller.kind).toBe('loading');
    await act(async () => {
      next.resolve();
      await next.promise;
    });
  });

  it('keeps an SSO hand-off loading until ownership changes', async () => {
    const { create, result, request, redirecting, canRun, rerender } = await setup();
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    redirecting.mockReturnValue(true);
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(result.current.card.isLoading).toBe(true);
    canRun.mockReturnValue(false);
    rerender({ requestKey: 'source_2' });
    expect(result.current.card.isLoading).toBe(false);
  });

  it('discards a recovery decision that arrives after the source changes', async () => {
    const { result, submit, recovery, rerender } = await setup({ ticket: '' });
    const decision = createDeferredPromise<SignInStartRecovery>();
    recovery.mockReturnValue(decision.promise);
    submit.mockRejectedValueOnce(apiError('form_password_incorrect'));
    const controller = result.current.controller;
    expect(controller.kind).toBe('form');
    if (controller.kind !== 'form') {
      throw new Error('Expected a sign-in form');
    }
    const pending = controller.handleFirstPartySubmit({
      preventDefault: vi.fn(),
    } as unknown as FormEvent<HTMLFormElement>);
    await waitFor(() => expect(recovery).toHaveBeenCalledOnce());
    rerender({ requestKey: 'source_2' });
    await act(async () => {
      decision.resolve('retry_identifier');
      await pending;
    });
    expect(submit).toHaveBeenCalledOnce();
    expect(result.current.card.error).toBeUndefined();
  });

  it('releases ticket loading when the controller closes', async () => {
    const { create, result, unmount, request } = await setup();
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    const begin = result.current.card.beginRequest;
    unmount();
    const release = begin();
    expect(release).toBeTypeOf('function');
    request.resolve();
    await request.promise;
    release?.();
  });

  it('does not revive an earlier form action when its source returns', async () => {
    const { result, rerender, submit } = await setup({ ticket: '' });
    const controller = result.current.controller;
    if (controller.kind !== 'form') {
      throw new Error('Expected a sign-in form');
    }
    rerender({ requestKey: 'source_2' });
    rerender({ requestKey: 'source_1' });
    await controller.handleFirstPartySubmit({ preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>);
    expect(submit).not.toHaveBeenCalled();
  });

  it('resets an OAuth error once under Strict Mode', async () => {
    const { clear, result, rerender } = await setup({ ticket: '', oauthError: true, strict: true });
    await waitFor(() => expect(clear).toHaveBeenCalledOnce());
    rerender({ requestKey: 'source_1' });
    expect(clear).toHaveBeenCalledOnce();
    expect(result.current.card.error).toBeDefined();
  });

  it('does not start an empty reset request beside ticket sign-in', async () => {
    const { clear, create, request } = await setup({ oauthError: true });
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(clear).not.toHaveBeenCalled();
    await act(async () => {
      request.resolve();
      await request.promise;
    });
  });
});
