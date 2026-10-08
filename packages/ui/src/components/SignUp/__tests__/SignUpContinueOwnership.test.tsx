import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignUpResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@/test/utils';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSignUpContinueController } from '../sign-up-continue.controller';
import { useSignUpContinueModel } from '../sign-up-continue.model';
import { SignUpContinue } from '../SignUpContinue';

const { createFixtures } = bindCreateFixtures('SignUp');
const completed = { status: 'complete', createdSessionId: 'sess_result' } as SignUpResource;
const failure = () =>
  new ClerkAPIResponseError('Update failed', {
    status: 422,
    data: [{ code: 'form_identifier_exists', message: 'This username is taken.', meta: { param_name: 'username' } }],
  });

const setup = () =>
  createFixtures(f => {
    f.withEmailAddress({ required: true });
    f.withUsername({ required: true });
    f.startSignUpWithEmailAddress({ emailVerificationStatus: 'verified' });
  });

const event = () => ({ preventDefault: vi.fn() }) as unknown as React.FormEvent<HTMLFormElement>;

describe('Sign-up continuation request ownership', () => {
  it('keeps the SDK result inside the model and completes the flow', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signUp.update.mockResolvedValueOnce(completed);
    const { result } = renderHook(() => useSignUpContinueModel(), { wrapper });
    await expect(result.current.submit({ username: 'clerkUser' })).resolves.toBeUndefined();
    expect(fixtures.signUp.update).toHaveBeenCalledWith({ username: 'clerkUser' });
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_result' }));
  });

  it.each(['user', 'session', 'organization', 'client'] as const)(
    'rejects retained commands after the canonical %s changes',
    async field => {
      const { wrapper, fixtures } = await setup();
      const { result } = renderHook(() => useSignUpContinueModel(), { wrapper });
      const model = result.current;
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await model.submit({ username: 'clerkUser' });
      await model.navigateToSignUp();
      expect(fixtures.signUp.update).not.toHaveBeenCalled();
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it('blocks a retained command when the persisted attempt ID changes before rendering', async () => {
    const { wrapper, fixtures } = await setup();
    const { result } = renderHook(() => useSignUpContinueModel(), { wrapper });
    fixtures.signUp.id = 'sua_other';
    await result.current.submit({ username: 'clerkUser' });
    expect(fixtures.signUp.update).not.toHaveBeenCalled();
  });

  it.each(['resolve', 'reject'] as const)('discards an update after unmount: %s', async outcome => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.update.mockReturnValueOnce(deferred.promise);
    const { result, unmount } = renderHook(() => useSignUpContinueModel(), { wrapper });
    const request = result.current.submit({ username: 'clerkUser' });
    unmount();
    await act(async () => {
      if (outcome === 'resolve') {
        deferred.resolve(completed);
      } else {
        deferred.reject(failure());
      }
      await request;
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('blocks completion when the caller becomes inactive', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.update.mockReturnValueOnce(deferred.promise);
    const { result } = renderHook(() => useSignUpContinueModel(), { wrapper });
    let active = false;
    await result.current.submit({ username: 'clerkUser' }, () => active);
    expect(fixtures.signUp.update).not.toHaveBeenCalled();
    active = true;
    const request = result.current.submit({ username: 'clerkUser' }, () => active);
    active = false;
    await act(async () => {
      deferred.resolve(completed);
      await request;
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('does not revive a request when the redirect target changes and returns', async () => {
    const { wrapper, fixtures, props } = await setup();
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/first' });
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.update.mockReturnValueOnce(deferred.promise);
    const { result, rerender } = renderHook(() => useSignUpContinueModel(), { wrapper });
    const old = result.current;
    const request = old.submit({ username: 'clerkUser' });
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/second' });
    rerender();
    props.setProps({ forceRedirectUrl: 'http://localhost:3000/first' });
    rerender();
    await act(async () => {
      deferred.resolve(completed);
      await request;
    });
    await old.submit({ username: 'anotherUser' });
    expect(fixtures.signUp.update).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('keeps one pending submission across rerenders', async () => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.update.mockReturnValueOnce(deferred.promise);
    const Card = withCardStateProvider(({ children }: React.PropsWithChildren) => <>{children}</>);
    const { result, rerender } = renderHook(() => useSignUpContinueController(useSignUpContinueModel()), {
      wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }),
    });
    let request: Promise<void>;
    act(() => {
      request = result.current.handleSubmit(event());
      expect(result.current.handleSubmit(event())).toBe(request);
    });
    rerender();
    expect(result.current.handleSubmit(event())).toBe(request!);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.signUp.update).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve(completed);
      await request;
    });
  });

  it('cancels queued dispatch when the controller unmounts', async () => {
    const { wrapper, fixtures } = await setup();
    const Card = withCardStateProvider(({ children }: React.PropsWithChildren) => <>{children}</>);
    const { result, unmount } = renderHook(() => useSignUpContinueController(useSignUpContinueModel()), {
      wrapper: ({ children }) => wrapper({ children: <Card>{children}</Card> }),
    });
    const request = result.current.handleSubmit(event());
    unmount();
    await request;
    expect(fixtures.signUp.update).not.toHaveBeenCalled();
  });

  it.each([false, true])('releases form loading after failure and allows retry (Strict Mode: %s)', async strict => {
    const { wrapper, fixtures } = await setup();
    const deferred = createDeferredPromise<SignUpResource>();
    fixtures.signUp.update.mockReturnValueOnce(deferred.promise).mockResolvedValueOnce(completed);
    const view = render(
      strict ? (
        <StrictMode>
          <SignUpContinue />
        </StrictMode>
      ) : (
        <SignUpContinue />
      ),
      { wrapper },
    );
    const input = screen.getByLabelText('Username');
    const button = screen.getByRole('button', { name: 'Continue' });
    const form = view.container.querySelector('form')!;
    fireEvent.change(input, { target: { value: 'clerkUser' } });
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(fixtures.signUp.update).toHaveBeenCalledOnce());
    expect(button).toBeDisabled();
    await act(async () => {
      deferred.reject(failure());
      await Promise.resolve();
    });
    await waitFor(() => expect(button).not.toBeDisabled());
    expect((await screen.findAllByTestId('form-feedback-error'))[0]).toHaveTextContent('This username is taken.');
    fireEvent.submit(form);
    await waitFor(() => expect(fixtures.signUp.update).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
  });

  it.each(['resolve', 'reject'] as const)(
    'resets the form and ignores the old request after config changes: %s',
    async outcome => {
      const { wrapper, fixtures, props } = await setup();
      const old = createDeferredPromise<SignUpResource>();
      const fresh = createDeferredPromise<SignUpResource>();
      fixtures.signUp.update.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
      const view = render(<SignUpContinue />, { wrapper });
      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'oldUser' } });
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(fixtures.signUp.update).toHaveBeenCalledOnce());
      act(() => props.setProps({ initialValues: { username: 'newUser' } }));
      view.rerender(<SignUpContinue />);
      expect(screen.getByLabelText('Username')).toHaveValue('newUser');
      const button = screen.getByRole('button', { name: 'Continue' });
      expect(button).not.toBeDisabled();
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(fixtures.signUp.update).toHaveBeenCalledTimes(2));
      await act(async () => {
        if (outcome === 'resolve') {
          old.resolve(completed);
        } else {
          old.reject(failure());
        }
        await Promise.resolve();
      });
      expect(button).toBeDisabled();
      expect(screen.queryByTestId('form-feedback-error')).not.toBeInTheDocument();
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      await act(async () => {
        fresh.resolve(completed);
        await Promise.resolve();
      });
      await waitFor(() => expect(button).not.toBeDisabled());
      expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    },
  );

  it('applies configured metadata inside the model', async () => {
    const { wrapper, fixtures, props } = await setup();
    props.setProps({ unsafeMetadata: { source: 'invitation' } });
    fixtures.signUp.update.mockResolvedValueOnce(completed);
    const { result } = renderHook(() => useSignUpContinueModel(), { wrapper });
    await result.current.submit({ username: 'clerkUser' });
    expect(fixtures.signUp.update).toHaveBeenCalledWith({
      username: 'clerkUser',
      unsafeMetadata: { source: 'invitation' },
    });
  });

  it.each(['user', 'session', 'organization', 'client'] as const)(
    'does not activate a pending result after the canonical %s changes',
    async field => {
      const { wrapper, fixtures } = await setup();
      const deferred = createDeferredPromise<SignUpResource>();
      fixtures.signUp.update.mockReturnValueOnce(deferred.promise);
      const { result } = renderHook(() => useSignUpContinueModel(), { wrapper });
      const request = result.current.submit({ username: 'clerkUser' });
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await act(async () => {
        deferred.resolve(completed);
        await request;
      });
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['email_address', './verify-email-address'],
    ['phone_number', './verify-phone-number'],
  ])('navigates to verification when %s is unverified', async (field, path) => {
    const { wrapper, fixtures } = await setup();
    fixtures.signUp.update.mockResolvedValueOnce({
      status: 'missing_requirements',
      missingFields: [],
      unverifiedFields: [field],
    } as unknown as SignUpResource);
    const { result } = renderHook(() => useSignUpContinueModel(), { wrapper });
    await result.current.submit({ username: 'clerkUser' });
    expect(fixtures.router.navigate).toHaveBeenCalledWith(path, expect.anything());
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('reads legal consent requirements from mutable SDK fields on each render', async () => {
    const { wrapper, fixtures } = await setup();
    const { result, rerender } = renderHook(() => useSignUpContinueModel(), { wrapper });
    fixtures.signUp.missingFields.splice(0, fixtures.signUp.missingFields.length, 'legal_accepted');
    fixtures.signUp.unverifiedFields.splice(0);
    rerender();
    expect(result.current.onlyLegalConsentMissing).toBe(true);
  });
});
