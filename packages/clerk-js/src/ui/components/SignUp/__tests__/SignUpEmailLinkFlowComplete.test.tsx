import React from 'react';

import { EmailLinkError, EmailLinkErrorCode } from '../../../../core/resources';
import { render, runFakeTimers, screen, waitFor } from '../../../../testUtils';
import { SignUpEmailLinkFlowComplete } from '../../../common/EmailLinkCompleteFlowCard';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';

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
    await runFakeTimers(async timers => {
      render(<SignUpEmailLinkFlowComplete />, { wrapper });
      timers.runOnlyPendingTimers();
      await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
    });
  });

  describe('Success', () => {
    it('shows the success message when successfully verified', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      await runFakeTimers(async timers => {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        timers.runOnlyPendingTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        screen.getByText(/success/i);
      });
    });
  });

  describe('Error messages', () => {
    it('shows the expired error message when the appropriate error is thrown', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      fixtures.clerk.handleEmailLinkVerification.mockImplementationOnce(
        await Promise.resolve(() => {
          throw new EmailLinkError(EmailLinkErrorCode.Expired);
        }),
      );

      await runFakeTimers(async timers => {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        timers.runOnlyPendingTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        screen.getByText(/expired/i);
      });
    });

    it('shows the failed error message when the appropriate error is thrown', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      fixtures.clerk.handleEmailLinkVerification.mockImplementationOnce(
        await Promise.resolve(() => {
          throw new EmailLinkError(EmailLinkErrorCode.Failed);
        }),
      );
      await runFakeTimers(async timers => {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        timers.runOnlyPendingTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        screen.getByText(/invalid/i);
      });
    });
  });
});
