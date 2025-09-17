import React from 'react';
import { describe, expect, it } from 'vitest';

import { EmailLinkError, EmailLinkErrorCodeStatus } from '../../../../core/resources';
import { render, screen, waitFor } from '../../../../vitestUtils';
import { SignUpEmailLinkFlowComplete } from '../../../common/EmailLinkCompleteFlowCard';
import { bindCreateFixtures } from '../../../utils/vitest/createFixtures';

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
