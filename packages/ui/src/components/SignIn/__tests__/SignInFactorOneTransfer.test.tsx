import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
    fixtures.signIn.attemptFirstFactor.mockImplementationOnce(() => {
      // Simulate SDK updating the resource before throwing (backend returns 404 with transferable in meta.client)
      fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;
      return Promise.reject(
        new ClerkAPIResponseError('Error', {
          data: [{ code: 'form_identifier_not_found', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });
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
    fixtures.signUp.create.mockResolvedValueOnce({ status: 'missing_requirements' } as any);

    const { userEvent } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => {
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../create/continue');
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
});
