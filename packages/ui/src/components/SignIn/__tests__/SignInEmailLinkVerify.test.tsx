import { afterEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { SignInEmailLinkVerify } from '../SignInEmailLinkVerify';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInEmailLinkVerify', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('shows the signed-in message when successfully verified', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
    });
    render(<SignInEmailLinkVerify />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
    await waitFor(() => {
      screen.getByText(/successfully signed in/i);
    });
  });

  it('completes the signUpIfMissing transfer when this client owns the sign-in', async () => {
    window.history.replaceState({}, '', '/sign-in/verify?__clerk_status=transferable');
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnumerationProtection();
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;
    fixtures.signUp.create.mockResolvedValueOnce({
      status: 'missing_requirements',
      missingFields: ['first_name'],
      unverifiedFields: [],
    } as any);

    render(<SignInEmailLinkVerify />, { wrapper });

    await waitFor(() => {
      expect(fixtures.signUp.create).toHaveBeenCalledWith(expect.objectContaining({ transfer: true }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../create/continue');
    });
  });

  it('points back to the original tab when another client owns the signUpIfMissing transfer', async () => {
    // The verify route lands with `__clerk_status=transferable` when the email was verified but
    // no user exists. Only the sign-in's client holds the banked transfer, so a link opened on
    // another device has nothing to consume here.
    window.history.replaceState({}, '', '/sign-in/verify?__clerk_status=transferable');
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnumerationProtection();
    });
    props.setProps({ withSignUp: true });

    render(<SignInEmailLinkVerify />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
    await waitFor(() => {
      screen.getByText('Email verified');
      screen.getByText(/return to original tab/i);
    });
    expect(fixtures.signUp.create).not.toHaveBeenCalled();
    expect(screen.queryByText(/successfully signed in/i)).toBeNull();
  });
});
