import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { SignInEmailLinkFlowComplete } from '../../../common/EmailLinkCompleteFlowCard';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInEmailLinkFlowComplete', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('shows the signed-in message when successfully verified', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
    });
    render(<SignInEmailLinkFlowComplete />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
    await waitFor(() => {
      screen.getByText(/successfully signed in/i);
    });
  });

  it('shows the email-verified message for a signUpIfMissing transfer instead of claiming a sign-in', async () => {
    // The verify route lands with `__clerk_status=transferable` when the email was
    // verified but no user exists; the original tab continues the flow as a sign-up.
    window.history.replaceState({}, '', '/sign-in/verify?__clerk_status=transferable');
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
    });
    render(<SignInEmailLinkFlowComplete />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
    await waitFor(() => {
      screen.getByText('Email verified');
      screen.getByText(/return to original tab/i);
    });
    expect(screen.queryByText(/successfully signed in/i)).toBeNull();
  });
});
