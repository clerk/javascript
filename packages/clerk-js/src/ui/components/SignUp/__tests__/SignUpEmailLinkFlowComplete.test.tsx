import React from 'react';

import { EmailLinkError, EmailLinkErrorCodeStatus } from '../../../../core/resources';
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
    it('handles verification and redirects instead of showing success message', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      await runFakeTimers(async timers => {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        timers.runOnlyPendingTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        // The component should not show a success message since it should redirect
        expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
      });
    });

    it('allows custom onVerifiedOnOtherDevice behavior', async () => {
      const customHandler = jest.fn();
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });

      // Mock handleEmailLinkVerification to call onVerifiedOnOtherDevice
      fixtures.clerk.handleEmailLinkVerification.mockImplementationOnce(async options => {
        // Simulate verification happening on a different device
        if (options.onVerifiedOnOtherDevice) {
          options.onVerifiedOnOtherDevice();
        }
        return null; // Return null to indicate no redirect happened
      });

      await runFakeTimers(async timers => {
        render(<SignUpEmailLinkFlowComplete onVerifiedOnOtherDevice={customHandler} />, { wrapper });
        timers.runOnlyPendingTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        // The custom handler should be called when verification happens on a different device
        expect(customHandler).toHaveBeenCalled();
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
          throw new EmailLinkError(EmailLinkErrorCodeStatus.Expired);
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
          throw new EmailLinkError(EmailLinkErrorCodeStatus.Failed);
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
