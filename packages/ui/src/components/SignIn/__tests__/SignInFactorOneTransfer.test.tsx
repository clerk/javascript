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
          data: [{ code: 'sign_up_if_missing_transfer', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });
    fixtures.clerk.client.sessions = [{ id: 'sess_123' }] as any;
    fixtures.signUp.create.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'sess_123' } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    // The transfer runs after the OTP card's ~750ms success animation resolves.
    await waitFor(
      () => {
        expect(fixtures.signUp.create).toHaveBeenCalledWith(
          expect.objectContaining({
            transfer: true,
          }),
        );
      },
      { timeout: 3000 },
    );
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
          data: [{ code: 'sign_up_if_missing_transfer', long_message: '', message: '' }],
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
    // Relative path keeps the transferred sign-up inside the combined <SignIn> flow.
    await waitFor(
      () => {
        expect(fixtures.router.navigate).toHaveBeenCalledWith('../create/continue');
      },
      { timeout: 3000 },
    );
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
          data: [{ code: 'sign_up_if_missing_transfer', long_message: '', message: '' }],
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
          data: [{ code: 'sign_up_if_missing_transfer', long_message: '', message: '' }],
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

  it('performs the transfer itself when a transferable email link was verified from the same client', async () => {
    const email = 'test@clerk.com';
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withPreferredSignInStrategy({ strategy: 'password' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailLink: true, identifier: email });
    });
    props.setProps({ withSignUp: true });

    // This tab is the sole consumer of the banked transfer regardless of which tab the link
    // opened in. `verifiedFromTheSameClient()` cannot arbitrate that - it reports false on a
    // development instance even for a tab of this same browser - so handing the transfer to the
    // opened tab would let both fire, and the loser's rejected create detaches the winner's
    // sign-up server-side.
    fixtures.signIn.createEmailLinkFlow.mockReturnValue({
      startEmailLinkFlow: vi.fn().mockResolvedValue({
        status: 'needs_first_factor',
        firstFactorVerification: {
          status: 'transferable',
          verifiedFromTheSameClient: () => true,
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
      expect(fixtures.signUp.create).toHaveBeenCalledWith(expect.objectContaining({ transfer: true }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../create/continue');
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
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../create/continue');
    });
  });

  // Every other email-link transfer case here resolves to `missing_requirements`, which routes
  // with a relative in-component navigate. A `complete` transfer instead has to leave the
  // component: it consumes the sign-in, so the SignIn route guard sends `factor-one` back to the
  // start path, and an in-component navigate loses that race and lands on a blank sign-in.
  it('leaves the component on a completed email-link transfer rather than routing in-component', async () => {
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
      status: 'complete',
      createdSessionId: 'sess_transfer',
    } as any);
    fixtures.clerk.setActive.mockImplementation(async (params: any) => {
      await params.navigate?.({ session: { currentTask: null }, decorateUrl: (url: string) => url });
    });

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.click(await screen.findByText('Use another method'));
    await userEvent.click(await screen.findByText(`Email link to ${email}`));

    await waitFor(() => {
      expect(fixtures.signUp.create).toHaveBeenCalledWith(expect.objectContaining({ transfer: true }));
      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_transfer' }));
    });

    // The terminal redirect must not go through the component's router.
    expect(fixtures.router.navigate).not.toHaveBeenCalledWith('../create/continue');
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
          data: [{ code: 'sign_up_if_missing_transfer', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });
    fixtures.signUp.create.mockResolvedValueOnce({ status: 'abandoned' } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });
    const input = screen.getByLabelText(/Enter verification code/i);

    await userEvent.type(input, '123456');

    // Success animation (~750ms) precedes the transfer, and the error feedback
    // resets the input after another ~750ms.
    await waitFor(
      () => {
        expect(fixtures.signUp.create).toHaveBeenCalled();
        expect(input).toHaveValue('');
        expect(input).not.toBeDisabled();
      },
      { timeout: 5000 },
    );
  });
});
