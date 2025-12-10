import { EmailLinkError, EmailLinkErrorCodeStatus } from '@clerk/shared/error';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { SignUpEmailLinkFlowComplete } from '../../../common/EmailLinkCompleteFlowCard';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpEmailLinkFlowComplete', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
    });
    render(<SignUpEmailLinkFlowComplete />, { wrapper });
    screen.getByText(/signing up/i);
  });

  it.todo('shows the component for at least 500ms before handling the flow');

  it('magic link verification is called', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
    });
    render(<SignUpEmailLinkFlowComplete />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
  });

  describe('Success', () => {
    it('shows the success message when successfully verified', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      render(<SignUpEmailLinkFlowComplete />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
      screen.getByText(/success/i);
    });
  });

  describe('Error messages', () => {
    it('shows the expired error message when the appropriate error is thrown', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      fixtures.clerk.handleEmailLinkVerification.mockImplementationOnce(() =>
        Promise.reject(new EmailLinkError(EmailLinkErrorCodeStatus.Expired)),
      );

      render(<SignUpEmailLinkFlowComplete />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
      screen.getByText(/expired/i);
    });

    it('shows the failed error message when the appropriate error is thrown', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      fixtures.clerk.handleEmailLinkVerification.mockImplementationOnce(() =>
        Promise.reject(new EmailLinkError(EmailLinkErrorCodeStatus.Failed)),
      );
      render(<SignUpEmailLinkFlowComplete />, { wrapper });
      await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
      screen.getByText(/invalid/i);
    });
  });
});
