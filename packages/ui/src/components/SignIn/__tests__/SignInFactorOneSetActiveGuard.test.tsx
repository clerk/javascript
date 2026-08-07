import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInFactorOne } from '../SignInFactorOne';
import { SignInFactorTwo } from '../SignInFactorTwo';

const { createFixtures } = bindCreateFixtures('SignIn');

/**
 * Mirrors the real `setActive` lifecycle: the flag goes up, the completed sign-in is consumed on
 * the client (`status` -> `null`), the card re-renders while the flag is still up (clerk-js emits
 * transitive state right before navigating), then the flag drops once navigation is done.
 */
const mockSetActiveLifecycle = (fixtures: any) => {
  let release = () => {};
  const gate = new Promise<void>(resolve => (release = resolve));

  fixtures.clerk.setActive.mockImplementation(async (params: any) => {
    fixtures.clerk.__internal_setActiveInProgress = true;
    fixtures.signIn.status = null;
    await gate;
    await params.navigate?.({ session: { currentTask: null }, decorateUrl: (url: string) => url });
    fixtures.clerk.__internal_setActiveInProgress = false;
  });

  return { finishSetActive: () => release() };
};

describe('SignIn setActive guard', () => {
  it('does not bounce factor one back to the start card once setActive has completed', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockResolvedValueOnce({
      status: 'complete',
      createdSessionId: 'sess_123',
    } as any);
    const { finishSetActive } = mockSetActiveLifecycle(fixtures);

    const { userEvent, rerender } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalled(), { timeout: 3000 });

    rerender(<SignInFactorOne />);
    finishSetActive();
    await waitFor(() => expect((fixtures.clerk as any).__internal_setActiveInProgress).toBe(false));

    // The host app keeps <SignIn> mounted until its own signed-in state propagates, so the card
    // re-renders at least once more after setActive resolves.
    rerender(<SignInFactorOne />);

    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalled());
    expect(fixtures.router.navigate).not.toHaveBeenCalledWith('../');
  });

  it('does not bounce back to the start card after a signUpIfMissing transfer completes', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.withEnumerationProtection();
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    fixtures.signIn.attemptFirstFactor.mockImplementationOnce(() => {
      (fixtures.signIn as any).firstFactorVerification = { status: 'transferable' };
      return Promise.reject(
        new ClerkAPIResponseError('Error', {
          data: [{ code: 'sign_up_if_missing_transfer', long_message: '', message: '' }],
          status: 404,
        }),
      );
    });
    // A sign-up with no additional requirements transfers straight to `complete`.
    fixtures.signUp.create.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'sess_123' } as any);
    const { finishSetActive } = mockSetActiveLifecycle(fixtures);

    const { userEvent, rerender } = render(<SignInFactorOne />, { wrapper });

    await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalled(), { timeout: 3000 });

    rerender(<SignInFactorOne />);
    finishSetActive();
    await waitFor(() => expect((fixtures.clerk as any).__internal_setActiveInProgress).toBe(false));

    // The terminal redirect leaves the page, but the document stays alive while the browser
    // fetches the next one, so the card can still re-render and bounce.
    rerender(<SignInFactorOne />);

    expect(fixtures.router.navigate).not.toHaveBeenCalledWith('../');
  });

  it('still bounces to the start card when the sign-in was abandoned without setActive', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    (fixtures.signIn as any).status = 'needs_identifier';

    render(<SignInFactorOne />, { wrapper });

    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('../'));
  });

  it('still bounces if another session is activated before the sign-in is abandoned', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withMultiSessionMode();
      f.withEmailAddress();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: false });
    });

    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    const { rerender } = render(<SignInFactorOne />, { wrapper });

    fixtures.clerk.__internal_setActiveInProgress = true;
    rerender(<SignInFactorOne />);

    fixtures.clerk.__internal_setActiveInProgress = false;
    (fixtures.signIn as any).status = 'needs_identifier';
    rerender(<SignInFactorOne />);

    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('../'), { timeout: 1000 });
  });

  it('still bounces factor two if another session is activated before the sign-in returns to factor one', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withMultiSessionMode();
      f.startSignInFactorTwo();
    });

    fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    const { rerender } = render(<SignInFactorTwo />, { wrapper });

    fixtures.clerk.__internal_setActiveInProgress = true;
    rerender(<SignInFactorTwo />);

    fixtures.clerk.__internal_setActiveInProgress = false;
    (fixtures.signIn as any).status = 'needs_first_factor';
    rerender(<SignInFactorTwo />);

    await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('../'), { timeout: 1000 });
  });
});
