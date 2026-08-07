import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignUpVerifyEmail } from '../SignUpVerifyEmail';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpVerifyEmail', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();
    render(<SignUpVerifyEmail />, { wrapper });
    screen.getByText(/verify/i);
  });

  it('shows the email associated with the sign up', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.prepareEmailAddressVerification.mockRejectedValue(null);
    const { findByText } = render(<SignUpVerifyEmail />, { wrapper });
    await waitFor(async () => expect(await findByText('test@clerk.com')).toBeInTheDocument());
  });

  it('shows the verify with link message', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_link'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.createEmailLinkFlow.mockImplementation(
      () =>
        ({
          startEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
          cancelEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
        }) as any,
    );

    const { findByText } = render(<SignUpVerifyEmail />, { wrapper });
    await waitFor(async () => expect(await findByText(/Verification Link/i)).toBeInTheDocument());
  });

  it('shows the verify with code message', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_code'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });

    fixtures.signUp.prepareEmailAddressVerification.mockRejectedValue(null);

    const { findByText } = render(<SignUpVerifyEmail />, { wrapper });
    await waitFor(async () => expect(await findByText(/Verify your email/i)).toBeInTheDocument());
    await waitFor(async () =>
      expect(await findByText(/Enter the verification code sent to your email/i)).toBeInTheDocument(),
    );
  });

  it('does not prepare a new email code when the persisted email verification is pending', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_code'] });
      f.startSignUpWithEmailAddress({
        emailAddress: 'pending-code@clerk.com',
        supportEmailLink: false,
        supportEmailCode: true,
      });
    });
    fixtures.signUp.prepareEmailAddressVerification.mockResolvedValue(fixtures.signUp);

    const { findByText } = render(<SignUpVerifyEmail />, { wrapper });
    await waitFor(async () => expect(await findByText(/Verify your email/i)).toBeInTheDocument());

    expect(fixtures.signUp.prepareEmailAddressVerification).not.toHaveBeenCalled();
  });

  it('prepares a new email code when the persisted email verification is expired', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_code'] });
      f.startSignUpWithEmailAddress({
        emailAddress: 'expired-code@clerk.com',
        supportEmailLink: false,
        supportEmailCode: true,
        emailVerificationStatus: 'expired',
      });
    });
    fixtures.signUp.prepareEmailAddressVerification.mockRejectedValue(null);

    render(<SignUpVerifyEmail />, { wrapper });

    await waitFor(() =>
      expect(fixtures.signUp.prepareEmailAddressVerification).toHaveBeenCalledWith({ strategy: 'email_code' }),
    );
  });

  it('clicking on the edit icon navigates to the previous route', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.prepareEmailAddressVerification.mockRejectedValue(null);

    const { userEvent } = render(<SignUpVerifyEmail />, { wrapper });
    await userEvent.click(
      screen.getByRole('button', {
        name: /edit/i,
      }),
    );
    expect(fixtures.router.navigate).toHaveBeenCalledWith('../', { searchParams: new URLSearchParams() });
  });

  it('Resend link button exists', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_link'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });
    fixtures.signUp.createEmailLinkFlow.mockImplementation(
      () =>
        ({
          startEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
          cancelEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
        }) as any,
    );
    const { findByText } = render(<SignUpVerifyEmail />, { wrapper });
    await waitFor(async () => expect((await findByText(/Resend/i)).tagName.toUpperCase()).toBe('BUTTON'));
  });

  it('Resend code button exists', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true, verifications: ['email_code'] });
      f.startSignUpWithEmailAddress({ emailAddress: 'test@clerk.com' });
    });

    fixtures.signUp.prepareEmailAddressVerification.mockRejectedValue(null);

    const { findByText } = render(<SignUpVerifyEmail />, { wrapper });
    await waitFor(async () => expect((await findByText(/Resend/i)).tagName.toUpperCase()).toBe('BUTTON'));
  });

  it.todo('Resend link button is pressable after 60 seconds');
  it.todo('Resend code button is pressable after 30 seconds');
});
