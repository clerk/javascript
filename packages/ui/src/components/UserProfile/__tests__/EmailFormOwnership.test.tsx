import { ClerkAPIResponseError } from '@clerk/shared/error';
import { CLERK_MODAL_STATE } from '@clerk/shared/internal/clerk-js/constants';
import type { EmailAddressResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, screen, waitFor } from '@/test/utils';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import { useEmailFormController } from '../email-form.controller';
import { useEmailFormModel } from '../email-form.model';
import type { EmailVerificationProps } from '../email-form.types';
import { useEmailVerificationController } from '../email-verification.controller';
import { EmailForm } from '../EmailForm';

const { createFixtures } = bindCreateFixtures('UserProfile');
const failure = () =>
  new ClerkAPIResponseError('Email failed', {
    status: 422,
    data: [{ code: 'email_failed', message: 'Email failed' }],
  });
const kinds = ['email_link', 'enterprise_sso'] as const;

async function setup(strategy: 'email_code' | 'email_link' | 'enterprise_sso' = 'email_code') {
  const view = await createFixtures(f => {
    f.withEmailAddress({ verifications: [strategy === 'enterprise_sso' ? 'email_code' : strategy] });
    f.withUser({ email_addresses: ['first@clerk.com', 'second@clerk.com'] });
  });
  const user = view.fixtures.clerk.user!;
  const [first, second] = user.emailAddresses;
  const flows = [first, second].map(email => {
    email.prepareVerification.mockResolvedValue(email);
    email.attemptVerification.mockResolvedValue(email);
    Object.assign(email, { matchesSsoConnection: strategy === 'enterprise_sso' });
    const start = vi.fn().mockResolvedValue(email);
    const cancel = vi.fn();
    email.createEmailLinkFlow.mockReturnValue({ startEmailLinkFlow: start, cancelEmailLinkFlow: cancel });
    email.createEnterpriseSSOLinkFlow.mockReturnValue({
      startEnterpriseSSOLinkFlow: start,
      cancelEnterpriseSSOLinkFlow: cancel,
    });
    return { start, cancel };
  });
  const switchAccount = () => {
    const replacement = { ...user, id: 'replacement', emailAddresses: [] };
    vi.spyOn(view.fixtures.clerk, 'user', 'get').mockReturnValue(replacement);
    view.fixtures.clerk.__internal_lastEmittedResources = {
      ...view.fixtures.clerk.__internal_lastEmittedResources,
      user: replacement,
    };
  };
  return { ...view, user, first, second, flows, switchAccount };
}

const formProps = () => ({ onSuccess: vi.fn(), onReset: vi.fn() });

describe('Email form ownership', () => {
  it('resolves current canonical resources and discards code verification results', async () => {
    const view = await setup();
    const hook = renderHook(() => useEmailFormModel({ emailId: view.first.id, ...formProps() }), {
      wrapper: view.wrapper,
    });
    const prepare = vi.fn().mockResolvedValue(view.first);
    const attempt = vi.fn().mockResolvedValue(view.first);
    view.user.emailAddresses[0] = { ...view.first, prepareVerification: prepare, attemptVerification: attempt };
    await expect(hook.result.current.verification.prepareVerification()).resolves.toBeUndefined();
    await expect(hook.result.current.verification.attemptVerification('123456')).resolves.toBeUndefined();
    expect(prepare).toHaveBeenCalledExactlyOnceWith({ strategy: 'email_code' });
    expect(attempt).toHaveBeenCalledExactlyOnceWith({ code: '123456' });
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
    expect(view.first.attemptVerification).not.toHaveBeenCalled();
    view.user.emailAddresses.splice(0, 1);
    await expect(hook.result.current.verification.prepareVerification()).rejects.toThrow('no longer available');
  });

  it.each(['user', 'session', 'client'] as const)(
    'blocks retained commands after canonical %s changes',
    async field => {
      const view = await setup();
      const hook = renderHook(() => useEmailFormModel({ emailId: view.first.id, ...formProps() }), {
        wrapper: view.wrapper,
      });
      const old = hook.result.current;
      vi.spyOn(view.fixtures.clerk, field, 'get').mockReturnValue({
        ...view.fixtures.clerk[field],
        id: 'other',
      } as never);
      await expect(old.createEmail('other@clerk.com')).resolves.toBe(false);
      await old.verification.prepareVerification();
      await old.verification.attemptVerification('123456');
      await expect(old.createEmailLinkFlow().start()).resolves.toBe(false);
      const flow = old.createEnterpriseSSOLinkFlow();
      await expect(flow.start()).resolves.toBe(false);
      await flow.open?.();
      expect(view.user.createEmailAddress).not.toHaveBeenCalled();
      expect(view.first.prepareVerification).not.toHaveBeenCalled();
      expect(view.first.attemptVerification).not.toHaveBeenCalled();
      expect(view.first.createEmailLinkFlow).not.toHaveBeenCalled();
      expect(view.first.createEnterpriseSSOLinkFlow).not.toHaveBeenCalled();
      expect(view.fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it('invalidates commands when the selected email changes away and back', async () => {
    const view = await setup();
    const hook = renderHook(({ id }) => useEmailFormModel({ emailId: id, ...formProps() }), {
      wrapper: view.wrapper,
      initialProps: { id: view.first.id },
    });
    const old = hook.result.current;
    hook.rerender({ id: view.second.id });
    expect(hook.result.current.identifier).toBe('second@clerk.com');
    hook.rerender({ id: view.first.id });
    expect(hook.result.current.requestKey).not.toBe(old.requestKey);
    await old.verification.prepareVerification();
    await expect(old.createEmailLinkFlow().start()).resolves.toBe(false);
    await expect(old.createEmail('other@clerk.com')).resolves.toBe(false);
    expect(view.first.prepareVerification).not.toHaveBeenCalled();
    expect(view.first.createEmailLinkFlow).not.toHaveBeenCalled();
    expect(view.user.createEmailAddress).not.toHaveBeenCalled();
  });

  it('uses a temporary created resource until the canonical list includes it', async () => {
    const view = await setup();
    const created = { ...view.first, id: 'created', emailAddress: 'created@clerk.com' };
    view.user.createEmailAddress.mockResolvedValueOnce(created);
    const hook = renderHook(() => useEmailFormModel(formProps()), { wrapper: view.wrapper });
    await act(async () => {
      expect(await hook.result.current.createEmail(created.emailAddress)).toBe(true);
    });
    expect(hook.result.current.identifier).toBe(created.emailAddress);
    await hook.result.current.verification.prepareVerification();
    expect(created.prepareVerification).toHaveBeenCalledOnce();
    view.user.emailAddresses.push(created);
    hook.rerender();
    view.user.emailAddresses.pop();
    await expect(hook.result.current.verification.attemptVerification('123456')).rejects.toThrow('no longer available');
    view.switchAccount();
    hook.rerender();
    expect(hook.result.current.identifier).toBe('');
    expect(hook.result.current.hasExistingEmail).toBe(false);
  });

  it.each(['success', 'failure'] as const)('ignores late email creation %s after a target change', async outcome => {
    const view = await setup();
    const deferred = createDeferredPromise<EmailAddressResource>();
    view.user.createEmailAddress.mockReturnValueOnce(deferred.promise);
    const hook = renderHook(({ id }: { id?: string }) => useEmailFormModel({ emailId: id, ...formProps() }), {
      wrapper: view.wrapper,
      initialProps: { id: undefined },
    });
    const pending = hook.result.current.createEmail('other@clerk.com');
    hook.rerender({ id: view.second.id });
    await act(async () => {
      if (outcome === 'success') {
        deferred.resolve(view.first);
      } else {
        deferred.reject(failure());
      }
      expect(await pending).toBe(false);
    });
    expect(hook.result.current.identifier).toBe(view.second.emailAddress);
  });

  it('does not retry creation after an account change during reverification', async () => {
    const view = await setup();
    view.user.createEmailAddress.mockRejectedValueOnce(
      new ClerkAPIResponseError('Reverification required', {
        status: 401,
        data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
      }),
    );
    const open = vi.spyOn(view.fixtures.clerk, '__internal_openReverification').mockImplementation(() => undefined);
    const hook = renderHook(() => useEmailFormModel(formProps()), { wrapper: view.wrapper });
    const pending = hook.result.current.createEmail('other@clerk.com');
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
    view.switchAccount();
    hook.rerender();
    await act(async () => {
      open.mock.calls[0][0].afterVerification!();
      expect(await pending).toBe(false);
    });
    expect(view.user.createEmailAddress).toHaveBeenCalledOnce();
    expect(hook.result.current.identifier).toBe('');
  });

  it.each(kinds)('cancels %s and settles its wait when the model unmounts', async kind => {
    const view = await setup(kind);
    view.flows[0].start.mockReturnValueOnce(new Promise(() => undefined));
    const hook = renderHook(() => useEmailFormModel({ emailId: view.first.id, ...formProps() }), {
      wrapper: view.wrapper,
    });
    const flow =
      kind === 'email_link'
        ? hook.result.current.createEmailLinkFlow()
        : hook.result.current.createEnterpriseSSOLinkFlow();
    const pending = flow.start();
    expect(flow.start()).toBe(pending);
    expect(view.flows[0].start).toHaveBeenCalledOnce();
    hook.unmount();
    await expect(pending).resolves.toBe(false);
    expect(view.flows[0].cancel).toHaveBeenCalledOnce();
    flow.cancel();
    expect(view.flows[0].cancel).toHaveBeenCalledOnce();
    await flow.open?.();
    expect(view.fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it.each(kinds)('cancels an active %s flow when its selected email changes', async kind => {
    const view = await setup(kind);
    view.flows[0].start.mockReturnValueOnce(new Promise(() => undefined));
    const hook = renderHook(({ id }) => useEmailFormModel({ emailId: id, ...formProps() }), {
      wrapper: view.wrapper,
      initialProps: { id: view.first.id },
    });
    const flow =
      kind === 'email_link'
        ? hook.result.current.createEmailLinkFlow()
        : hook.result.current.createEnterpriseSSOLinkFlow();
    const pending = flow.start();
    hook.rerender({ id: view.second.id });
    await expect(pending).resolves.toBe(false);
    expect(view.flows[0].cancel).toHaveBeenCalledOnce();
    await expect(flow.start()).resolves.toBe(false);
    expect(view.flows[0].start).toHaveBeenCalledOnce();
  });

  it.each(kinds)('uses the canonical %s resource at flow start', async kind => {
    const view = await setup(kind);
    const hook = renderHook(() => useEmailFormModel({ emailId: view.first.id, ...formProps() }), {
      wrapper: view.wrapper,
    });
    const flow =
      kind === 'email_link'
        ? hook.result.current.createEmailLinkFlow()
        : hook.result.current.createEnterpriseSSOLinkFlow();
    const factory = vi.fn().mockReturnValue({
      startEmailLinkFlow: view.flows[1].start,
      cancelEmailLinkFlow: view.flows[1].cancel,
      startEnterpriseSSOLinkFlow: view.flows[1].start,
      cancelEnterpriseSSOLinkFlow: view.flows[1].cancel,
    });
    view.user.emailAddresses[0] = { ...view.first, createEmailLinkFlow: factory, createEnterpriseSSOLinkFlow: factory };
    await expect(flow.start()).resolves.toBeUndefined();
    expect(factory).toHaveBeenCalledOnce();
    expect(view.flows[1].start).toHaveBeenCalledOnce();
    expect(view.flows[0].start).not.toHaveBeenCalled();
  });

  it('uses the current SSO redirect and rejects an absent redirect', async () => {
    const view = await setup('enterprise_sso');
    const hook = renderHook(() => useEmailFormModel({ emailId: view.first.id, ...formProps() }), {
      wrapper: view.wrapper,
    });
    const flow = hook.result.current.createEnterpriseSSOLinkFlow();
    await expect(flow.open?.()).rejects.toThrow('redirect URL is not available');
    expect(view.fixtures.router.navigate).not.toHaveBeenCalled();
    view.user.emailAddresses[0] = {
      ...view.first,
      verification: {
        ...view.first.verification,
        externalVerificationRedirectURL: new URL('https://idp.example.com/latest'),
      },
    };
    await flow.open?.();
    expect(view.fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith('https://idp.example.com/latest');
  });

  it.each(['email_code', ...kinds] as const)(
    'resets the rendered %s screen after an account change',
    async strategy => {
      const view = await setup(strategy);
      const props = { emailId: view.first.id, ...formProps() };
      const rendered = render(<EmailForm {...props} />, { wrapper: view.wrapper });
      await screen.findByRole('heading', { name: 'Verify email address' });
      view.switchAccount();
      rendered.rerender(<EmailForm {...props} />);
      expect(screen.queryByRole('heading', { name: 'Verify email address' })).not.toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    },
  );

  it.each(['success', 'failure'] as const)(
    'deduplicates creation and ignores late %s after the form unmounts',
    async outcome => {
      const view = await setup();
      const deferred = createDeferredPromise<EmailAddressResource>();
      view.user.createEmailAddress.mockReturnValueOnce(deferred.promise);
      const props = formProps();
      let model!: ReturnType<typeof useEmailFormModel>;
      let controller!: ReturnType<typeof useEmailFormController>;
      let card!: ReturnType<typeof useCardState>;
      const Probe = () => {
        controller = useEmailFormController(model, props);
        return null;
      };
      const Boundary = withCardStateProvider(({ visible }: { visible: boolean }) => {
        card = useCardState();
        return visible ? <Probe /> : null;
      });
      const Parent = ({ visible = true }: { visible?: boolean }) => {
        model = useEmailFormModel(props);
        return <Boundary visible={visible} />;
      };
      const rendered = render(<Parent />, { wrapper: view.wrapper });
      let pending!: Promise<void>;
      act(() => {
        const event = { preventDefault: vi.fn() } as any;
        pending = controller.addEmail(event);
        expect(controller.addEmail(event)).toBe(pending);
      });
      expect(view.user.createEmailAddress).toHaveBeenCalledOnce();
      rendered.rerender(<Parent visible={false} />);
      act(() => {
        card.setError('Current error');
      });
      await act(async () => {
        if (outcome === 'success') {
          deferred.resolve(view.first);
        } else {
          deferred.reject(failure());
        }
        await pending;
      });
      expect(model.identifier).toBe('');
      expect(props.onSuccess).not.toHaveBeenCalled();
      expect(card.error).toBe('Current error');
    },
  );

  it('uses a new verification factory after the source changes and cancels on reset', async () => {
    const view = await setup();
    const starts = [vi.fn().mockResolvedValue(false), vi.fn().mockResolvedValue(false)];
    const cancels = [vi.fn(), vi.fn()];
    const props = formProps();
    let controller!: ReturnType<typeof useEmailVerificationController>;
    const Probe = (input: EmailVerificationProps) => {
      controller = useEmailVerificationController(input);
      return null;
    };
    const Boundary = withCardStateProvider(Probe);
    const rendered = render(
      <Boundary
        requestKey='first'
        createFlow={() => ({ start: starts[0], cancel: cancels[0] })}
        nextStep={props.onSuccess}
        onReset={props.onReset}
      />,
      { wrapper: view.wrapper },
    );
    await waitFor(() => expect(starts[0]).toHaveBeenCalledOnce());
    rendered.rerender(
      <Boundary
        requestKey='second'
        createFlow={() => ({ start: starts[1], cancel: cancels[1] })}
        nextStep={props.onSuccess}
        onReset={props.onReset}
      />,
    );
    await waitFor(() => expect(starts[1]).toHaveBeenCalledOnce());
    expect(cancels[0]).toHaveBeenCalledOnce();
    act(() => {
      controller.onReset();
    });
    expect(cancels[1]).toHaveBeenCalledOnce();
    expect(props.onReset).toHaveBeenCalledOnce();
    expect(props.onSuccess).not.toHaveBeenCalled();
  });

  it('handles a synchronous flow factory failure', async () => {
    const view = await setup();
    let card!: ReturnType<typeof useCardState>;
    const Probe = () => {
      card = useCardState();
      useEmailVerificationController({
        createFlow: () => {
          throw failure();
        },
        nextStep: vi.fn(),
        onReset: vi.fn(),
      });
      return null;
    };
    const Boundary = withCardStateProvider(Probe);
    render(<Boundary />, { wrapper: view.wrapper });
    await waitFor(() => expect(card.error).toBe('Email failed'));
  });

  it.each(['email_code', ...kinds] as const)('creates an email and completes %s verification', async strategy => {
    const view = await setup(strategy);
    const created = { ...view.second, id: 'created', emailAddress: 'created@clerk.com' };
    view.user.createEmailAddress.mockResolvedValueOnce(created);
    const props = formProps();
    const rendered = render(<EmailForm {...props} />, { wrapper: view.wrapper });
    await rendered.userEvent.type(screen.getByLabelText(/email address/i), created.emailAddress);
    await rendered.userEvent.click(screen.getByRole('button', { name: /^Add$/i }));
    await screen.findByRole('heading', { name: 'Verify email address' });
    expect(view.user.createEmailAddress).toHaveBeenCalledExactlyOnceWith({ email: created.emailAddress });
    if (strategy === 'email_code') {
      await rendered.userEvent.type(screen.getByLabelText('Enter verification code'), '123456');
      expect(view.second.attemptVerification).toHaveBeenCalledExactlyOnceWith({ code: '123456' });
    } else {
      expect(view.flows[1].start).toHaveBeenCalledOnce();
    }
    await waitFor(() => expect(props.onSuccess).toHaveBeenCalledExactlyOnceWith());
  });

  it('keeps modal state in the SSO redirect URL', async () => {
    const view = await setup('enterprise_sso');
    view.props.setProps({ componentName: 'UserProfile', mode: 'modal' } as any);
    const hook = renderHook(() => useEmailFormModel({ emailId: view.first.id, ...formProps() }), {
      wrapper: view.wrapper,
    });
    await hook.result.current.createEnterpriseSSOLinkFlow().start();
    const url = view.flows[0].start.mock.calls[0][0].redirectUrl;
    expect(JSON.parse(window.atob(new URL(url).searchParams.get(CLERK_MODAL_STATE)!))).toMatchObject({
      componentName: 'UserProfile',
    });
  });

  it('uses the hosted profile URL for a virtual email-link flow', async () => {
    const view = await setup('email_link');
    view.props.setProps({ componentName: 'UserProfile', routing: 'virtual', mode: 'modal' } as any);
    const hook = renderHook(() => useEmailFormModel({ emailId: view.first.id, ...formProps() }), {
      wrapper: view.wrapper,
    });
    await hook.result.current.createEmailLinkFlow().start();
    const url = new URL(view.flows[0].start.mock.calls[0][0].redirectUrl);
    const hosted = new URL(view.fixtures.environment.displayConfig.userProfileUrl);
    expect(url.origin).toBe(hosted.origin);
    expect(url.pathname).toBe(hosted.pathname);
    expect(url.hash).toBe('#/verify');
  });

  it('ignores a rejected old verification after retry and preserves the current error', async () => {
    const view = await setup();
    const old = createDeferredPromise<void>();
    const props = formProps();
    const start = vi.fn().mockReturnValueOnce(old.promise).mockResolvedValue(false);
    const cancel = vi.fn();
    let controller!: ReturnType<typeof useEmailVerificationController>;
    let card!: ReturnType<typeof useCardState>;
    const Probe = () => {
      card = useCardState();
      controller = useEmailVerificationController({
        createFlow: () => ({ start, cancel }),
        nextStep: props.onSuccess,
        onReset: props.onReset,
      });
      return null;
    };
    const Boundary = withCardStateProvider(Probe);
    render(<Boundary />, { wrapper: view.wrapper });
    await waitFor(() => expect(start).toHaveBeenCalledOnce());
    act(() => {
      controller.startVerification();
      card.setError('Current error');
    });
    await act(async () => {
      old.reject(failure());
      await old.promise.catch(() => undefined);
    });
    expect(cancel).toHaveBeenCalledOnce();
    expect(card.error).toBe('Current error');
    expect(props.onSuccess).not.toHaveBeenCalled();
  });
});
