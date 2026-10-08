import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { type PropsWithChildren, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';
import { localizationKeys } from '@/ui/localization';

import { SignInFactorOneCodeForm } from '../SignInFactorOneCodeForm';

const { createFixtures } = bindCreateFixtures('SignIn');
const codeProps = () => ({
  factor: { strategy: 'phone_code' as const, phoneNumberId: 'idn_123', safeIdentifier: '+1234567890' },
  factorAlreadyPrepared: false,
  onFactorPrepare: vi.fn(),
  cardTitle: localizationKeys('signIn.phoneCode.title'),
  cardSubtitle: localizationKeys('signIn.phoneCode.subtitle'),
  inputLabel: localizationKeys('signIn.phoneCode.formTitle'),
  resendButton: localizationKeys('signIn.phoneCode.resendButton'),
  identityPreviewEditButtonAriaLabel: localizationKeys('identityPreviewEditButton__phoneNumber'),
});
const setup = async (strict = false) => {
  const { wrapper: Fixture, fixtures } = await createFixtures(f => {
    f.withPhoneNumber();
    f.startSignInWithPhoneNumber({ supportPhoneCode: true });
  });
  fixtures.signIn.id = 'sin_initial';
  fixtures.signIn.firstFactorVerification.status = 'expired';
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
  return { wrapper, fixtures };
};
const response = { status: 'needs_first_factor' } as SignInResource;

describe('Sign-in first-factor code preparation', () => {
  it('sends one code under Strict Mode and keeps the phone input visible', async () => {
    const { wrapper, fixtures } = await setup(true);
    fixtures.signIn.prepareFirstFactor.mockResolvedValue(response);
    const props = codeProps();
    const { getByLabelText } = render(<SignInFactorOneCodeForm {...props} />, { wrapper });
    await waitFor(() => expect(props.onFactorPrepare).toHaveBeenCalledTimes(1));
    expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledExactlyOnceWith(props.factor);
    expect(getByLabelText('Enter verification code')).toBeInTheDocument();
  });

  it('does not send another code when an empty attempt receives its ID', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signIn.id = undefined;
    fixtures.signIn.prepareFirstFactor.mockImplementation(() => {
      fixtures.signIn.id = 'sin_assigned';
      return Promise.resolve(response);
    });
    const props = codeProps();
    const { rerender } = render(<SignInFactorOneCodeForm {...props} />, { wrapper });
    await waitFor(() => expect(props.onFactorPrepare).toHaveBeenCalledTimes(1));
    rerender(<SignInFactorOneCodeForm {...props} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledTimes(1);
  });

  it('prepares a new channel without reporting the old channel result', async () => {
    const { wrapper, fixtures } = await setup();
    const first = createDeferredPromise<SignInResource>();
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(first.promise).mockResolvedValueOnce(response);
    const props = codeProps();
    const { rerender } = render(<SignInFactorOneCodeForm {...props} />, { wrapper });
    await waitFor(() => expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledTimes(1));
    const next = { ...props, factor: { ...props.factor, channel: 'whatsapp' as const }, onFactorPrepare: vi.fn() };
    rerender(<SignInFactorOneCodeForm {...next} />);
    await waitFor(() => expect(next.onFactorPrepare).toHaveBeenCalledTimes(1));
    await act(async () => {
      first.resolve(response);
      await first.promise;
    });
    expect(props.onFactorPrepare).not.toHaveBeenCalled();
    expect(fixtures.signIn.prepareFirstFactor).toHaveBeenLastCalledWith(next.factor);
  });

  it('does not prepare a pending SMS verification when its channel is implicit', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signIn.firstFactorVerification.status = 'unverified';
    fixtures.signIn.firstFactorVerification.strategy = 'phone_code';
    fixtures.signIn.firstFactorVerification.channel = 'sms';
    render(<SignInFactorOneCodeForm {...codeProps()} />, { wrapper });
    await act(async () => {
      await Promise.resolve();
    });
    expect(fixtures.signIn.prepareFirstFactor).not.toHaveBeenCalled();
  });

  it('prepares an expired factor even when the parent previously prepared it', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signIn.prepareFirstFactor.mockResolvedValue(response);
    render(
      <SignInFactorOneCodeForm
        {...codeProps()}
        factorAlreadyPrepared
      />,
      { wrapper },
    );
    await waitFor(() => expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledTimes(1));
  });

  it('routes an owned Protect response without reporting factor preparation', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signIn.prepareFirstFactor.mockResolvedValue({
      status: 'needs_protect_check',
      protectCheck: { status: 'pending' },
    } as SignInResource);
    const props = codeProps();
    render(<SignInFactorOneCodeForm {...props} />, { wrapper });
    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check'));
    expect(props.onFactorPrepare).not.toHaveBeenCalled();
  });

  it('ignores a Protect response after the screen closes', async () => {
    const { wrapper, fixtures } = await setup();
    const request = createDeferredPromise<SignInResource>();
    fixtures.signIn.prepareFirstFactor.mockReturnValue(request.promise);
    const props = codeProps();
    const { unmount } = render(<SignInFactorOneCodeForm {...props} />, { wrapper });
    await waitFor(() => expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledTimes(1));
    unmount();
    request.resolve({ status: 'needs_protect_check', protectCheck: { status: 'pending' } } as SignInResource);
    await request.promise;
    await Promise.resolve();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
    expect(props.onFactorPrepare).not.toHaveBeenCalled();
  });

  it('ignores a preparation error after a different attempt takes ownership before render', async () => {
    const { wrapper, fixtures } = await setup();
    const request = createDeferredPromise<SignInResource>();
    fixtures.signIn.prepareFirstFactor.mockReturnValue(request.promise);
    const { queryByText } = render(<SignInFactorOneCodeForm {...codeProps()} />, { wrapper });
    await waitFor(() => expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledTimes(1));
    fixtures.signIn.id = 'sin_other';
    await act(async () => {
      request.reject(
        new ClerkAPIResponseError('Failed', {
          status: 500,
          data: [{ code: 'internal_server_error', message: 'Failed', long_message: 'Please try again' }],
        }),
      );
      await request.promise.catch(() => undefined);
    });
    expect(queryByText('Please try again')).not.toBeInTheDocument();
  });

  it('renders email code verification and sends the email factor', async () => {
    const { wrapper, fixtures } = await setup();
    fixtures.signIn.prepareFirstFactor.mockResolvedValue(response);
    const props = {
      ...codeProps(),
      factor: { strategy: 'email_code' as const, emailAddressId: 'email_1', safeIdentifier: 'test@example.com' },
    };
    const { getByLabelText } = render(<SignInFactorOneCodeForm {...props} />, { wrapper });
    await waitFor(() => expect(props.onFactorPrepare).toHaveBeenCalledTimes(1));
    expect(fixtures.signIn.prepareFirstFactor).toHaveBeenCalledExactlyOnceWith(props.factor);
    expect(getByLabelText('Enter verification code')).toBeInTheDocument();
  });
});
