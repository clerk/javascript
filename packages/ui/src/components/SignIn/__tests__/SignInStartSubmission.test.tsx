import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, fireEvent, render, waitFor } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useSignInStartController } from '../sign-in-start.controller';
import { useSignInStartModel } from '../sign-in-start.model';
import { SignInStartView } from '../sign-in-start.view';

const { createFixtures } = bindCreateFixtures('SignIn');
const response = { status: 'needs_first_factor' } as SignInResource;
const failure = (code = 'submission_error') =>
  new ClerkAPIResponseError('Submission failed', {
    data: [{ code, message: 'Submission failed', long_message: 'Submission failed' }],
    status: 422,
  });

describe('Sign-in start submission lifecycle', () => {
  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      animationName: '',
      pointerEvents: 'auto',
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setup = async (alternativePhone = false) => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword({ required: true });
      if (alternativePhone) {
        f.withPhoneNumber({ channels: ['sms', 'whatsapp'] });
      }
    });
    let releaseExternal: (() => void) | undefined;
    const Status = () => {
      const card = useCardState();
      return (
        <>
          <span data-testid='card-status'>{card.isLoading ? 'loading' : 'idle'}</span>
          <button
            type='button'
            onClick={() => {
              releaseExternal = card.beginRequest();
            }}
          >
            External action
          </button>
        </>
      );
    };
    const Flow = ({ source }: { source: string }) => {
      const model = useSignInStartModel();
      const controller = useSignInStartController({ ...model, requestKey: `${model.requestKey}:${source}` });
      return <SignInStartView {...controller} />;
    };
    const Harness = ({ source = 'first', show = true }: { source?: string; show?: boolean }) => (
      <CardStateProvider>
        <Status />
        {show && <Flow source={source} />}
      </CardStateProvider>
    );
    const request = createDeferredPromise<SignInResource>();
    fixtures.signIn.create.mockReturnValue(request.promise);
    const view = render(<Harness />, { wrapper });
    const email = view.getByLabelText(/email address/i);
    fireEvent.change(email, { target: { value: 'user@example.com' } });
    fireEvent.change(view.container.querySelector('#password-field')!, { target: { value: 'secret' } });
    return {
      ...view,
      fixtures,
      request,
      Harness,
      email,
      form: () => view.container.querySelector('form')!,
      forgot: () => view.getByText(/Forgot password/i),
      releaseExternal: () => releaseExternal?.(),
    };
  };

  it('locks forgot-password requests against duplicate clicks and normal submission', async () => {
    const { fixtures, request, forgot, form, getByRole, getByTestId } = await setup();
    act(() => {
      fireEvent.click(forgot());
      fireEvent.click(forgot());
      fireEvent.submit(form());
    });
    expect(fixtures.signIn.create).toHaveBeenCalledExactlyOnceWith({ identifier: 'user@example.com' });
    expect(getByTestId('card-status')).toHaveTextContent('loading');
    expect(getByRole('button', { name: /Continue/ })).toBeDisabled();
    await act(async () => {
      request.resolve(response);
      await request.promise;
    });
    expect(getByTestId('card-status')).toHaveTextContent('idle');
    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('blocks forgot-password requests during normal submission', async () => {
    const { fixtures, request, forgot, form } = await setup();
    act(() => {
      fireEvent.submit(form());
      fireEvent.click(forgot());
    });
    expect(fixtures.signIn.create).toHaveBeenCalledExactlyOnceWith({
      identifier: 'user@example.com',
      password: 'secret',
      strategy: 'password',
    });
    await act(async () => {
      request.resolve(response);
      await request.promise;
    });
  });

  it('does not start forgot-password requests while another Card action owns loading', async () => {
    const { fixtures, forgot, getByRole, releaseExternal, request } = await setup();
    fireEvent.click(getByRole('button', { name: 'External action' }));
    fireEvent.click(forgot());
    expect(fixtures.signIn.create).not.toHaveBeenCalled();
    act(releaseExternal);
    fireEvent.click(forgot());
    expect(fixtures.signIn.create).toHaveBeenCalledOnce();
    await act(async () => {
      request.resolve(response);
      await request.promise;
    });
  });

  it('releases forgot-password loading after a handled failure and permits a new request', async () => {
    const { fixtures, request, forgot, form, getByTestId, getByText } = await setup();
    fireEvent.click(forgot());
    await act(async () => {
      request.reject(failure());
      await request.promise.catch(() => undefined);
    });
    expect(getByTestId('card-status')).toHaveTextContent('idle');
    getByText('Submission failed');
    fixtures.signIn.create.mockResolvedValue(response);
    fireEvent.submit(form());
    await waitFor(() => expect(fixtures.signIn.create).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getByTestId('card-status')).toHaveTextContent('idle'));
  });

  it('holds the request across a password fallback and retries the submitted identifier', async () => {
    const { fixtures, request, email, forgot, form, getByRole, getByTestId } = await setup();
    const retry = createDeferredPromise<SignInResource>();
    fireEvent.submit(form());
    fireEvent.change(email, { target: { value: 'changed@example.com' } });
    fixtures.signIn.create.mockReturnValue(retry.promise);
    await act(async () => {
      request.reject(failure('form_password_incorrect'));
      await request.promise.catch(() => undefined);
    });
    expect(fixtures.signIn.create).toHaveBeenLastCalledWith({ identifier: 'user@example.com' });
    expect(getByTestId('card-status')).toHaveTextContent('loading');
    expect(getByRole('button', { name: /Continue/ })).toBeDisabled();
    fireEvent.click(forgot());
    fireEvent.submit(form());
    expect(fixtures.signIn.create).toHaveBeenCalledTimes(2);
    await act(async () => {
      retry.resolve(response);
      await retry.promise;
    });
    expect(getByTestId('card-status')).toHaveTextContent('idle');
  });

  it('stops after one identifier-only retry and shows the remaining error', async () => {
    const { fixtures, form, getByTestId, getByText } = await setup();
    fixtures.signIn.create
      .mockRejectedValueOnce(failure('form_password_incorrect'))
      .mockRejectedValueOnce(failure('form_password_incorrect'))
      .mockResolvedValue(response);
    fireEvent.submit(form());
    await waitFor(() => expect(getByTestId('card-status')).toHaveTextContent('idle'));
    expect(fixtures.signIn.create).toHaveBeenCalledTimes(2);
    getByText('Submission failed');
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('does not retry an identifier-only forgot-password request as a password fallback', async () => {
    const { fixtures, forgot, getByTestId } = await setup();
    fixtures.signIn.create.mockRejectedValueOnce(failure('form_password_incorrect')).mockResolvedValue(response);
    fireEvent.click(forgot());
    await waitFor(() => expect(getByTestId('card-status')).toHaveTextContent('idle'));
    expect(fixtures.signIn.create).toHaveBeenCalledExactlyOnceWith({ identifier: 'user@example.com' });
  });

  it.each(['normal', 'forgot password'] as const)(
    'releases an old %s request on a source change without releasing its replacement',
    async kind => {
      const { fixtures, request, form, forgot, rerender, Harness, getByTestId } = await setup();
      if (kind === 'normal') {
        fireEvent.submit(form());
      } else {
        fireEvent.click(forgot());
      }
      const oldForm = form();
      const next = createDeferredPromise<SignInResource>();
      fixtures.signIn.create.mockReturnValue(next.promise);
      rerender(<Harness source='second' />);
      expect(form()).not.toBe(oldForm);
      expect(getByTestId('card-status')).toHaveTextContent('idle');
      fireEvent.submit(form());
      expect(fixtures.signIn.create).toHaveBeenCalledTimes(2);
      await act(async () => {
        request.resolve({ status: 'needs_identifier' } as SignInResource);
        await request.promise;
      });
      expect(getByTestId('card-status')).toHaveTextContent('loading');
      await act(async () => {
        next.resolve(response);
        await next.promise;
      });
      expect(getByTestId('card-status')).toHaveTextContent('idle');
    },
  );

  it.each(['normal', 'forgot password'] as const)('releases a pending %s request when the flow closes', async kind => {
    const { request, form, forgot, rerender, Harness, getByTestId, getByRole } = await setup();
    if (kind === 'normal') {
      fireEvent.submit(form());
    } else {
      fireEvent.click(forgot());
    }
    rerender(<Harness show={false} />);
    expect(getByTestId('card-status')).toHaveTextContent('idle');
    fireEvent.click(getByRole('button', { name: 'External action' }));
    await act(async () => {
      request.resolve(response);
      await request.promise;
    });
    expect(getByTestId('card-status')).toHaveTextContent('loading');
  });

  it('shows the parent controller error in the alternative phone form', async () => {
    const { fixtures, request, getByRole, getByText, form, container, getByTestId } = await setup(true);
    fireEvent.click(getByRole('button', { name: /whatsapp/i }));
    fireEvent.change(container.querySelector('input[type="tel"]')!, { target: { value: '+14155552671' } });
    fireEvent.submit(form());
    expect(fixtures.signIn.create).toHaveBeenCalledExactlyOnceWith({
      identifier: '+14155552671',
      strategy: 'phone_code',
      channel: 'whatsapp',
    });
    await act(async () => {
      request.reject(failure());
      await request.promise.catch(() => undefined);
    });
    getByText('Submission failed');
    expect(getByTestId('card-status')).toHaveTextContent('idle');
  });
});
