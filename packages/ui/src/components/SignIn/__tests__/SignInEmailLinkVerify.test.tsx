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

  // The banked transfer is consumed exactly once, and this tab cannot tell whether the polling
  // tab is about to consume it: `verifiedAtClient` does not match on a development instance even
  // when both tabs share a client. A second consumer would have its create rejected, and that
  // rejection detaches the winner's sign-up server-side, so this tab never transfers.
  it('leaves the signUpIfMissing transfer to the polling tab even when this client owns the sign-in', async () => {
    window.history.replaceState({}, '', '/sign-in/verify?__clerk_status=transferable');
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEnumerationProtection();
    });
    props.setProps({ withSignUp: true });

    fixtures.signIn.firstFactorVerification = { status: 'transferable' } as any;

    render(<SignInEmailLinkVerify />, { wrapper });

    await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
    await waitFor(() => {
      screen.getByText('Email verified');
      screen.getByText(/return to original tab/i);
    });
    expect(fixtures.signUp.create).not.toHaveBeenCalled();
    expect(fixtures.router.navigate).not.toHaveBeenCalledWith('../create/continue');
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
