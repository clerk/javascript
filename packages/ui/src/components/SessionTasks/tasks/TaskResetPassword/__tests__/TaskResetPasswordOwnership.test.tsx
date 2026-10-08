import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, renderHook, waitFor } from '@/test/utils';

import { TaskResetPassword } from '..';
import { useTaskResetPasswordModel } from '../task-reset-password.model';

const { createFixtures } = bindCreateFixtures('TaskResetPassword');
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });
async function setup() {
  const result = await createFixtures(f => {
    f.withUser({ email_addresses: ['first@clerk.com'], tasks: [{ key: 'reset-password' }] });
  });
  result.props.setProps({ redirectUrlComplete: '/done' });
  return result;
}

function fill(view: ReturnType<typeof render>) {
  fireEvent.change(view.getByLabelText(/new password/i), { target: { value: 'testtest' } });
  fireEvent.change(view.getByLabelText(/confirm password/i), { target: { value: 'testtest' } });
}

describe('password-reset request ownership', () => {
  it('keeps one submission pending through password update and activation', async () => {
    const { wrapper, fixtures } = await setup();
    const update = createDeferredPromise<unknown>();
    const activation = createDeferredPromise<void>();
    fixtures.clerk.user!.updatePassword.mockReturnValue(update.promise);
    fixtures.clerk.setActive.mockReturnValue(activation.promise);
    const sessionId = fixtures.clerk.session!.id;
    const view = render(<TaskResetPassword />, { wrapper });
    fill(view);
    const button = view.getByRole('button', { name: /reset password$/i });
    const form = view.container.querySelector('form')!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    await waitFor(() => expect(fixtures.clerk.user!.updatePassword).toHaveBeenCalledOnce());
    expect(button).toBeDisabled();
    expect(view.getByLabelText(/new password/i)).toBeDisabled();
    await act(async () => {
      update.resolve({});
      await update.promise;
    });
    await waitFor(() =>
      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: sessionId })),
    );
    expect(button).toBeDisabled();
    fireEvent.submit(form);
    expect(fixtures.clerk.user!.updatePassword).toHaveBeenCalledOnce();
    await act(async () => {
      activation.resolve();
      await activation.promise;
    });
    await waitFor(() => expect(button).toBeEnabled());
  });

  it.each(['actor', 'session', 'client', 'unmount', 'caller'] as const)(
    'does not activate after the request loses its %s',
    async loss => {
      const { wrapper, fixtures } = await setup();
      const update = createDeferredPromise<unknown>();
      fixtures.clerk.user!.updatePassword.mockReturnValue(update.promise);
      const { result, unmount } = renderHook(useTaskResetPasswordModel, { wrapper });
      let active = true;
      const request = result.current.updatePassword('testtest', true, () => active);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        active = false;
      } else if (loss === 'actor') {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
      } else if (loss === 'session') {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
      } else {
        vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
      }
      await act(async () => {
        update.resolve({});
        await request;
      });
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    },
  );

  it('invalidates old callbacks when the redirect changes and returns', async () => {
    const { wrapper, fixtures, props } = await setup();
    const update = createDeferredPromise<unknown>();
    fixtures.clerk.user!.updatePassword.mockReturnValue(update.promise);
    const { result, rerender } = renderHook(useTaskResetPasswordModel, { wrapper });
    const old = result.current;
    const request = old.updatePassword('testtest', true);
    props.setProps({ redirectUrlComplete: '/other' });
    rerender();
    props.setProps({ redirectUrlComplete: '/done' });
    rerender();
    expect(result.current.scopeKey).not.toBe(old.scopeKey);
    await act(async () => {
      update.resolve({});
      await request;
      await old.updatePassword('testtest', true);
    });
    expect(fixtures.clerk.user!.updatePassword).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it.each(['success', 'failure'] as const)('keeps a replacement form pending after an old %s', async outcome => {
    const { wrapper, fixtures } = await setup();
    const first = createDeferredPromise<unknown>();
    const second = createDeferredPromise<unknown>();
    const update = fixtures.clerk.user!.updatePassword;
    update.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const view = render(<TaskResetPassword />, { wrapper });
    fill(view);
    fireEvent.submit(view.container.querySelector('form')!);
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    const user = { ...fixtures.clerk.user!, id: 'user_second' };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    view.rerender(<TaskResetPassword />);
    expect(view.getByLabelText(/new password/i)).toHaveValue('');
    expect(view.getByLabelText(/confirm password/i)).toHaveValue('');
    fill(view);
    const button = view.getByRole('button', { name: /reset password$/i });
    fireEvent.submit(view.container.querySelector('form')!);
    await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    await act(async () => {
      if (outcome === 'success') {
        first.resolve({});
      } else {
        first.reject(failure());
      }
      await first.promise.catch(() => {});
    });
    expect(button).toBeDisabled();
    expect(view.queryByText('Please try again')).not.toBeInTheDocument();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    await act(async () => {
      second.resolve({});
      await second.promise;
    });
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
  });

  it('reports a current failure and permits a retry', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.user!.updatePassword.mockRejectedValueOnce(failure()).mockResolvedValueOnce({});
    const view = render(<TaskResetPassword />, { wrapper });
    fill(view);
    fireEvent.submit(view.container.querySelector('form')!);
    expect(await view.findByText('Please try again')).toBeVisible();
    expect(view.getByLabelText(/new password/i)).toBeEnabled();
    fireEvent.submit(view.container.querySelector('form')!);
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
    expect(fixtures.clerk.user!.updatePassword).toHaveBeenCalledTimes(2);
  });

  it('cancels a queued submission on immediate unmount', async () => {
    const { wrapper, fixtures } = await setup();
    const view = render(<TaskResetPassword />, { wrapper });
    fill(view);
    act(() => {
      fireEvent.submit(view.container.querySelector('form')!);
      view.unmount();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.clerk.user!.updatePassword).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'preserves completion navigation during its SDK transition (Strict Mode: %s)',
    async strict => {
      const { wrapper, fixtures } = await setup();
      fixtures.clerk.user!.updatePassword.mockResolvedValue({});
      const user = fixtures.clerk.user!;
      const session = fixtures.clerk.session!;
      const component = <TaskResetPassword />;
      const view = render(strict ? <StrictMode>{component}</StrictMode> : component, { wrapper });
      fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
        fixtures.clerk.__internal_setActiveInProgress = true;
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
        view.unmount();
        const args = { session: { ...session, user, currentTask: null }, decorateUrl: (url: string) => url };
        await Promise.all([navigate?.(args), navigate?.(args)]);
        fixtures.clerk.__internal_setActiveInProgress = false;
      });
      fill(view);
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith('/done'));
    },
  );

  it.each(['actor', 'session', 'unmount'] as const)(
    'rejects activation navigation after an unrelated %s',
    async loss => {
      const { wrapper, fixtures } = await setup();
      fixtures.clerk.user!.updatePassword.mockResolvedValue({});
      const user = fixtures.clerk.user!;
      const session = fixtures.clerk.session!;
      const { result, unmount } = renderHook(useTaskResetPasswordModel, { wrapper });
      fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
        if (loss === 'unmount') {
          unmount();
        }
        await navigate?.({
          session: {
            ...session,
            id: loss === 'session' ? 'session_other' : session.id,
            user: loss === 'actor' ? { ...user, id: 'user_other' } : user,
            currentTask: null,
          },
          decorateUrl: url => url,
        });
      });
      await act(async () => {
        await result.current.updatePassword('testtest', true);
      });
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it('rejects a callback after activation settles', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.user!.updatePassword.mockResolvedValue({});
    let navigate: Parameters<typeof fixtures.clerk.setActive>[0]['navigate'];
    fixtures.clerk.setActive.mockImplementationOnce(params => {
      navigate = params.navigate;
      return Promise.resolve();
    });
    const { result } = renderHook(useTaskResetPasswordModel, { wrapper });
    await act(async () => {
      await result.current.updatePassword('testtest', true);
    });
    await navigate?.({
      session: { ...fixtures.clerk.session!, user: fixtures.clerk.user!, currentTask: null },
      decorateUrl: url => url,
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('does not retry reverification for a replacement session', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.clerk.user!.updatePassword.mockRejectedValueOnce(
      new ClerkAPIResponseError('Verification required', {
        status: 403,
        data: [{ code: 'session_reverification_required', message: 'Verification required' }],
      }),
    );
    const { result } = renderHook(useTaskResetPasswordModel, { wrapper });
    const request = result.current.updatePassword('testtest', true);
    await waitFor(() => expect(fixtures.clerk.__internal_openReverification).toHaveBeenCalledOnce());
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
    await act(async () => {
      fixtures.clerk.__internal_openReverification.mock.calls[0][0].afterVerification();
      await request;
    });
    expect(fixtures.clerk.user!.updatePassword).toHaveBeenCalledOnce();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it.each([false, true])('checks redirect ownership while the SDK transition renders (changed: %s)', async changed => {
    const { wrapper, fixtures, props } = await setup();
    fixtures.clerk.user!.updatePassword.mockResolvedValue({});
    const user = fixtures.clerk.user!;
    const session = fixtures.clerk.session!;
    const { result, rerender } = renderHook(useTaskResetPasswordModel, { wrapper });
    const scope = result.current.scopeKey;
    fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
      fixtures.clerk.__internal_setActiveInProgress = true;
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        user: undefined,
        session: undefined,
      };
      if (changed) {
        props.setProps({ redirectUrlComplete: '/other' });
      }
      rerender();
      if (changed) {
        expect(result.current.scopeKey).not.toBe(scope);
      } else {
        expect(result.current.scopeKey).toBe(scope);
      }
      await navigate?.({ session: { ...session, user, currentTask: null }, decorateUrl: url => url });
      fixtures.clerk.__internal_setActiveInProgress = false;
    });
    await act(async () => {
      await result.current.updatePassword('testtest', true);
    });
    if (changed) {
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    } else {
      expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith('/done');
    }
  });

  it('holds form loading while sign-out is pending and prevents a password submit', async () => {
    const { wrapper, fixtures } = await setup();
    const pending = createDeferredPromise<void>();
    fixtures.clerk.signOut.mockReturnValue(pending.promise);
    const view = render(<TaskResetPassword />, { wrapper });
    fill(view);
    const button = view.getByRole('button', { name: /reset password$/i });
    fireEvent.click(view.getByRole('link', { name: /sign out/i }));
    fireEvent.click(view.getByRole('link', { name: /sign out/i }));
    await waitFor(() => expect(fixtures.clerk.signOut).toHaveBeenCalledOnce());
    fireEvent.submit(view.container.querySelector('form')!);
    expect(button).toBeDisabled();
    expect(fixtures.clerk.user!.updatePassword).not.toHaveBeenCalled();
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    await waitFor(() => expect(button).toBeEnabled());
  });

  it.each([null, { key: 'choose-organization' }])(
    'continues activation after the password response removes the reset task (%j)',
    async nextTask => {
      const { wrapper, fixtures } = await setup();
      const pending = createDeferredPromise<unknown>();
      fixtures.clerk.user!.updatePassword.mockReturnValue(pending.promise);
      const user = fixtures.clerk.user!;
      const originalSession = fixtures.clerk.session!;
      const view = render(<TaskResetPassword />, { wrapper });
      fill(view);
      fireEvent.submit(view.container.querySelector('form')!);
      await waitFor(() => expect(user.updatePassword).toHaveBeenCalledOnce());
      const session = { ...originalSession, user, currentTask: nextTask };
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        session,
      };
      view.rerender(<TaskResetPassword />);
      expect(view.getByLabelText(/new password/i)).toHaveValue('testtest');
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
      fixtures.clerk.setActive.mockImplementationOnce(async ({ navigate }) => {
        await navigate?.({ session, decorateUrl: url => url });
      });
      await act(async () => {
        pending.resolve({});
        await pending.promise;
      });
      await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledOnce());
      if (nextTask) {
        expect(fixtures.router.navigate).toHaveBeenCalledWith(expect.stringContaining('choose-organization'));
      } else {
        expect(fixtures.router.navigate).toHaveBeenCalledExactlyOnceWith('/done');
      }
    },
  );

  it('preserves sign-out navigation when the runtime clears the client', async () => {
    const { wrapper, fixtures } = await setup();
    const { result, unmount } = renderHook(useTaskResetPasswordModel, { wrapper });
    fixtures.clerk.signOut.mockImplementationOnce(async callback => {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(undefined);
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(undefined);
      vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: '' });
      unmount();
      if (typeof callback === 'function') {
        await callback();
      }
    });
    await act(async () => {
      await result.current.signOut();
    });
    expect(fixtures.router.navigate).toHaveBeenCalledOnce();
  });

  it.each([null, { key: 'choose-organization' }])(
    'checks the task again for a replacement session (%j)',
    async nextTask => {
      const { wrapper, fixtures } = await setup();
      const view = render(<TaskResetPassword />, { wrapper });
      fill(view);
      const session = { ...fixtures.clerk.session!, id: 'session_other', currentTask: nextTask };
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
      fixtures.clerk.__internal_lastEmittedResources = {
        ...fixtures.clerk.__internal_lastEmittedResources!,
        session,
      };
      view.rerender(<TaskResetPassword />);
      expect(view.queryByLabelText(/new password/i)).not.toBeInTheDocument();
      await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalled());
      expect(fixtures.clerk.user!.updatePassword).not.toHaveBeenCalled();
    },
  );
});
