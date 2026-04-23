import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInFactorOne } from '../SignInFactorOne';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInFactorOne sign-up-if-missing transfer', () => {
  it('triggers sign-up transfer when attemptFirstFactor fails with transferable status', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    // The SDK updates firstFactorVerification on the resource *before* throwing
    // the API error. This coupling is intentional — the component reads the
    // resource status inside the catch block to decide whether to transfer.
    fixtures.signIn.attemptFirstFactor.mockImplementationOnce(() => {
      fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;
      return Promise.reject(
        new ClerkAPIResponseError('Error', {
          data: [{ code: 'form_identifier_not_found', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });
    fixtures.clerk.client.sessions = [{ id: 'sess_123' }] as any;
    fixtures.signUp.create.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'sess_123' } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => {
      expect(fixtures.signUp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transfer: true,
        }),
      );
    });
  });

  it('navigates to create/continue when transfer results in missing_requirements', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockImplementationOnce(() => {
      fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;
      return Promise.reject(
        new ClerkAPIResponseError('Error', {
          data: [{ code: 'form_identifier_not_found', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });
    fixtures.signUp.create.mockResolvedValueOnce({
      status: 'missing_requirements',
      missingFields: ['first_name'],
      unverifiedFields: [],
    } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => {
      expect(fixtures.router.navigate).toHaveBeenCalledWith(expect.stringContaining('continue'));
    });
  });

  it('does not trigger transfer when enumeration protection is disabled', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockImplementationOnce(() => {
      fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;
      return Promise.reject(
        new ClerkAPIResponseError('Error', {
          data: [{ code: 'form_identifier_not_found', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => {
      expect(fixtures.signUp.create).not.toHaveBeenCalled();
    });
  });

  it('does not trigger transfer when not in combined flow', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockImplementationOnce(() => {
      fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;
      return Promise.reject(
        new ClerkAPIResponseError('Error', {
          data: [{ code: 'form_identifier_not_found', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => {
      expect(fixtures.signUp.create).not.toHaveBeenCalled();
    });
  });

  it('proceeds to second factor for existing users (no transfer)', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockResolvedValueOnce({
      status: 'needs_second_factor',
      firstFactorVerification: { status: 'verified' },
    } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => {
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../factor-two');
      expect(fixtures.signUp.create).not.toHaveBeenCalled();
    });
  });

  it('triggers sign-up transfer when email link verification becomes transferable', async () => {
    const email = 'test@clerk.com';
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withPreferredSignInStrategy({ strategy: 'password' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailLink: true, identifier: email });
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.createEmailLinkFlow.mockReturnValue({
      startEmailLinkFlow: vi.fn().mockResolvedValue({
        status: 'needs_first_factor',
        firstFactorVerification: {
          status: 'transferable',
          verifiedFromTheSameClient: () => false,
        },
      }),
      cancelEmailLinkFlow: vi.fn(),
    } as any);
    fixtures.signUp.create.mockResolvedValueOnce({
      status: 'missing_requirements',
      missingFields: ['first_name'],
      unverifiedFields: [],
    } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.click(await screen.findByText('Use another method'));
    await userEvent.click(await screen.findByText(`Email link to ${email}`));

    await waitFor(() => {
      expect(fixtures.signUp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transfer: true,
        }),
      );
      expect(fixtures.router.navigate).toHaveBeenCalledWith(expect.stringContaining('continue'));
    });
  });

  it('surfaces transfer errors instead of leaving the code form loading', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockImplementationOnce(() => {
      fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;
      return Promise.reject(
        new ClerkAPIResponseError('Error', {
          data: [{ code: 'form_identifier_not_found', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });
    fixtures.signUp.create.mockResolvedValueOnce({ status: 'abandoned' } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });
    const input = screen.getByLabelText(/Enter verification code/i);

    await userEvent.type(input, '123456');

    await waitFor(() => {
      expect(fixtures.signUp.create).toHaveBeenCalled();
      expect(input).toHaveValue('');
      expect(input).not.toBeDisabled();
    });
  });
});
