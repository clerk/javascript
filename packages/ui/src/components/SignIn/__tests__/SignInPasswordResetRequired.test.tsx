import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { PathRouter } from '../../../router';
import { SignIn } from '../index';

const { createFixtures } = bindCreateFixtures('SignIn');

const passwordError = (code: string, long_message: string) =>
  new ClerkAPIResponseError('Error', {
    data: [{ code, long_message, message: long_message, meta: { param_name: 'password' } }],
    status: 422,
  });

const PASSWORD_RESET_REQUIRED = passwordError(
  'password_reset_required',
  'This account requires a password reset before sign-in can continue. Please reset your password or contact support.',
);

const setup = async ({ globalClerk, error }: { globalClerk: boolean; error: ClerkAPIResponseError }) => {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withEmailAddress();
    f.withPassword({ required: true });
    f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: true, supportResetPassword: true });
  });
  vi.mocked(fixtures.clerk.navigate).mockImplementation((to: string) => {
    window.history.pushState({}, '', new URL(to, window.location.href).href);
    return Promise.resolve();
  });
  fixtures.signIn.create
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce({ status: 'needs_first_factor' } as SignInResource);
  fixtures.signIn.prepareFirstFactor.mockResolvedValue({} as SignInResource);
  window.Clerk = globalClerk ? (fixtures.clerk as typeof window.Clerk) : undefined;

  return { wrapper, fixtures };
};

const submitAutofilledPassword = async (wrapper: React.FC<{ children: React.ReactNode }>) => {
  window.history.replaceState({}, '', '/sign-in');
  const result = render(
    <PathRouter basePath='/sign-in'>
      <SignIn />
    </PathRouter>,
    { wrapper },
  );
  await result.userEvent.type(screen.getByLabelText(/email address/i), 'hello@clerk.com');
  fireEvent.change(result.container.querySelector('#password-field') as Element, {
    target: { value: 'some-password' },
  });
  fireEvent.submit(result.container.querySelector('form') as Element);
  return result;
};

describe('SignIn with a password autofilled on the first step', () => {
  const originalClerk = window.Clerk;

  afterEach(() => {
    window.Clerk = originalClerk;
    window.history.replaceState({}, '', '/');
  });

  it.each([
    ['Clerk is also window.Clerk', true],
    ['Clerk comes from the npm package and window.Clerk is not set', false],
  ])('opens the password reset screen when the password needs a reset and %s', async (_, globalClerk) => {
    const { wrapper, fixtures } = await setup({ globalClerk, error: PASSWORD_RESET_REQUIRED });
    const { userEvent } = await submitAutofilledPassword(wrapper);

    await screen.findByText('Password reset required');
    expect(window.location.pathname).toBe('/sign-in/factor-one');
    screen.getByText('You need to reset your password before you can use it again.');
    screen.getByText('Email code to hello@clerk.com');
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(fixtures.signIn.create).toHaveBeenCalledTimes(2);
    expect(fixtures.signIn.create).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ password: expect.anything() }),
    );

    await userEvent.click(screen.getByText('Reset your password'));
    await screen.findByText('First, enter the code sent to your email address');
  });

  it('asks for the password again on the next step when the password was found in a breach', async () => {
    const { wrapper } = await setup({
      globalClerk: false,
      error: passwordError('form_password_pwned', 'Password has been found in an online data breach.'),
    });
    await submitAutofilledPassword(wrapper);

    await screen.findByLabelText('Password');
    expect(window.location.pathname).toBe('/sign-in/factor-one');
    expect(screen.queryByText('Password reset required')).not.toBeInTheDocument();
  });
});
