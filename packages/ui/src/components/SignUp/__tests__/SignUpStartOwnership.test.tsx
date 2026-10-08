import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignUpResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { type PropsWithChildren, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useSignUpStartController } from '../sign-up-start.controller';
import { useSignUpStartModel } from '../sign-up-start.model';
import { SignUpStart } from '../SignUpStart';

const { createFixtures } = bindCreateFixtures('SignUp');
const completed = { status: 'complete', createdSessionId: 'sess_result' } as SignUpResource;

async function setup(ticket = false) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: `http://localhost/sign-up${ticket ? '?__clerk_ticket=invitation' : ''}` },
  });
  return createFixtures(f => {
    f.withEmailAddress({ required: true });
  });
}

describe('Sign-up start request ownership', () => {
  it.each(['user', 'session', 'organization', 'client'] as const)(
    'rejects retained commands after the canonical %s changes',
    async field => {
      const { wrapper, fixtures } = await setup();
      const { result } = renderHook(() => useSignUpStartModel(), { wrapper });
      const model = result.current;
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await act(async () => {
        await model.submit({ emailAddress: 'test@clerk.com' }, { useTicket: false });
        await model.createTicket('invitation');
        await model.resetOAuthAttempt();
      });
      expect(fixtures.signUp.create).not.toHaveBeenCalled();
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    },
  );

  it.each(['resolve', 'reject'] as const)('discards a submission after unmount: %s', async outcome => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    const { result, unmount } = renderHook(() => useSignUpStartModel(), { wrapper });
    const request = result.current.submit({ emailAddress: 'test@clerk.com' }, { useTicket: false });
    unmount();
    await act(async () => {
      if (outcome === 'resolve') {
        deferred.resolve(completed);
      } else {
        deferred.reject(new Error('old request failed'));
      }
      await request;
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('does not activate a result when the account changes before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useSignUpStartModel(), { wrapper });
    const request = result.current.submit({ emailAddress: 'test@clerk.com' }, { useTicket: false });
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ id: 'other' } as never);
    await act(async () => {
      deferred.resolve(completed);
      await request;
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('resets an OAuth error once in Strict Mode and releases loading on failure', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signUp.verifications.externalAccount.error = { code: 'oauth_access_denied', message: 'Access denied' };
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise).mockResolvedValueOnce(completed);
    const view = render(
      <StrictMode>
        <SignUpStart />
      </StrictMode>,
      { wrapper },
    );
    await waitFor(() => expect(fixtures.signUp.create).toHaveBeenCalledOnce());
    expect(fixtures.signUp.create).toHaveBeenCalledWith({});
    const form = view.container.querySelector('form')!;
    fireEvent.submit(form);
    expect(fixtures.signUp.create).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.reject(
        new ClerkAPIResponseError('Reset failed', {
          status: 422,
          data: [{ code: 'form_identifier_not_found', message: 'Reset failed' }],
        }),
      );
      await expect(deferred.promise).rejects.toThrow('Reset failed');
    });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@clerk.com' } });
    fireEvent.submit(form);
    await waitFor(() => expect(fixtures.signUp.create).toHaveBeenCalledTimes(2));
  });

  it('discards a result after the redirect target changes and returns', async () => {
    const { wrapper, fixtures, props } = await setup();
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/first' });
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    const { result, rerender } = renderHook(() => useSignUpStartModel(), { wrapper });
    const old = result.current;
    const request = old.submit({ emailAddress: 'test@clerk.com' }, { useTicket: false });
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/second' });
    rerender();
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/first' });
    rerender();
    await act(async () => {
      deferred.resolve(completed);
      await request;
    });
    await old.resetOAuthAttempt();
    expect(fixtures.signUp.create).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('permits creation to assign an attempt ID before completion', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    const { result, rerender } = renderHook(() => useSignUpStartModel(), { wrapper });
    const request = result.current.submit({ emailAddress: 'test@clerk.com' }, { useTicket: false });
    fixtures.signUp.id = 'sua_created';
    rerender();
    await act(async () => {
      deferred.resolve(completed);
      await request;
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
  });

  it('does not activate a ticket result after the account changes', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signUp.create.mockResolvedValueOnce(completed);
    const { result } = renderHook(() => useSignUpStartModel(), { wrapper });
    const ticket = await result.current.createTicket('invitation');
    expect(ticket).toBeDefined();
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ id: 'other' } as never);
    await ticket?.complete();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('discards a pending ticket when its source unmounts', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    const { result, unmount } = renderHook(() => useSignUpStartModel(), { wrapper });
    const request = result.current.createTicket('invitation');
    unmount();
    deferred.resolve(completed);
    await expect(request).resolves.toBeUndefined();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it.each([false, true])('creates a ticket once in Strict Mode with OAuth error: %s', async oauth => {
    const { wrapper, fixtures } = await setup(true);
    if (oauth) {
      fixtures.signUp.verifications.externalAccount.error = { code: 'oauth_access_denied', message: 'Access denied' };
    }
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    const view = render(
      <StrictMode>
        <SignUpStart />
      </StrictMode>,
      { wrapper },
    );
    await waitFor(() => expect(fixtures.signUp.create).toHaveBeenCalledOnce());
    expect(fixtures.signUp.create).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: 'ticket', ticket: 'invitation' }),
    );
    view.unmount();
    await act(async () => {
      deferred.resolve(completed);
      await deferred.promise;
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.signUp.create).toHaveBeenCalledOnce();
  });

  it('keeps another request loading when an old ticket finishes', async () => {
    const { wrapper, fixtures } = await setup(true);
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    let card!: ReturnType<typeof useCardState>;
    const Content = () => {
      const model = useSignUpStartModel();
      useSignUpStartController(model);
      return null;
    };
    const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
      card = useCardState();
      return visible ? <Content /> : null;
    });
    const view = render(<Boundary visible />, { wrapper });
    await waitFor(() => expect(fixtures.signUp.create).toHaveBeenCalledOnce());
    expect(card.isLoading).toBe(true);
    view.rerender(<Boundary visible={false} />);
    expect(card.isLoading).toBe(false);
    let release!: () => void;
    act(() => {
      release = card.beginRequest()!;
    });
    await act(async () => {
      deferred.resolve(completed);
      await deferred.promise;
    });
    expect(card.isLoading).toBe(true);
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    act(() => {
      release();
    });
    expect(card.isLoading).toBe(false);
  });

  it('submits once and permits retry after failure', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise).mockResolvedValueOnce(completed);
    const view = render(<SignUpStart />, { wrapper });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@clerk.com' } });
    const form = view.container.querySelector('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(fixtures.signUp.create).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.reject(
        new ClerkAPIResponseError('Request failed', {
          status: 422,
          data: [{ code: 'form_identifier_not_found', message: 'Request failed' }],
        }),
      );
      await expect(deferred.promise).rejects.toThrow('Request failed');
    });
    fireEvent.submit(form);
    await waitFor(() => expect(fixtures.signUp.create).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
  });
});

describe('Sign-up ticket SSO loading ownership', () => {
  it.each([
    'creationFailure',
    'redirectFailure',
    'redirectSuccess',
    'protectField',
    'protectResource',
    'verification',
  ] as const)('retains loading only for a successful SSO handoff: %s', async scenario => {
    const { wrapper, fixtures } = await setup(true);
    fixtures.signUp.missingFields = ['enterprise_sso'];
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.create.mockReturnValueOnce(deferred.promise);
    const failure = new ClerkAPIResponseError('SSO failed', {
      status: 422,
      data: [{ code: 'oauth_access_denied', message: 'SSO failed' }],
    });
    if (scenario === 'redirectFailure') {
      fixtures.signUp.authenticateWithRedirect.mockRejectedValueOnce(failure);
    } else {
      fixtures.signUp.authenticateWithRedirect.mockResolvedValueOnce(undefined);
    }
    const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
    const FixtureWrapper = wrapper;
    const Wrapper = ({ children }: PropsWithChildren) => (
      <FixtureWrapper>
        <CardBoundary>{children}</CardBoundary>
      </FixtureWrapper>
    );
    const hook = renderHook(
      () => {
        const model = useSignUpStartModel();
        const controller = useSignUpStartController(model);
        const card = useCardState();
        return { model, controller, card };
      },
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(fixtures.signUp.create).toHaveBeenCalledOnce());
    expect(hook.result.current.card.isLoading).toBe(true);
    expect(hook.result.current.model.isRedirectingToSSOProvider()).toBe(false);
    await act(async () => {
      if (scenario === 'creationFailure') {
        deferred.reject(failure);
        await expect(deferred.promise).rejects.toThrow('SSO failed');
      } else {
        deferred.resolve({
          ...fixtures.signUp,
          status: 'missing_requirements',
          missingFields:
            scenario === 'verification'
              ? []
              : scenario === 'protectField'
                ? ['protect_check', 'enterprise_sso']
                : ['enterprise_sso'],
          protectCheck: scenario === 'protectResource' ? { status: 'needs_verification' } : null,
          unverifiedFields: scenario === 'verification' ? ['email_address'] : [],
        } as SignUpResource);
        await deferred.promise;
      }
    });
    const redirects = scenario === 'redirectSuccess';
    expect(hook.result.current.model.isRedirectingToSSOProvider()).toBe(redirects);
    expect(hook.result.current.controller.isLoading).toBe(redirects);
    expect(hook.result.current.card.isLoading).toBe(redirects);
    if (scenario === 'protectField' || scenario === 'protectResource') {
      expect(fixtures.router.navigate).toHaveBeenCalledWith('protect-check', expect.anything());
      expect(fixtures.signUp.authenticateWithRedirect).not.toHaveBeenCalled();
    } else if (scenario === 'verification') {
      expect(fixtures.router.navigate).toHaveBeenCalledWith('verify-email-address', expect.anything());
      expect(fixtures.signUp.authenticateWithRedirect).not.toHaveBeenCalled();
    } else if (scenario !== 'creationFailure') {
      expect(fixtures.signUp.authenticateWithRedirect).toHaveBeenCalledOnce();
    }
    hook.unmount();
  });
});
