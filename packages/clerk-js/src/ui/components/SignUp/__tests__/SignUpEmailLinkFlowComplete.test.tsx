import React from 'react';

import { MagicLinkError, MagicLinkErrorCode } from '../../../../core/resources';
import { bindCreateFixtures, render, runFakeTimers, screen, waitFor } from '../../../../testUtils';
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
    await runFakeTimers(async timers => {
      render(<SignUpEmailLinkFlowComplete />, { wrapper });
      timers.runOnlyPendingTimers();
      await waitFor(() => expect(fixtures.clerk.handleMagicLinkVerification).toHaveBeenCalled());
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
        await waitFor(() => expect(fixtures.clerk.handleMagicLinkVerification).toHaveBeenCalled());
        screen.getByText(/success/i);
      });
    });
  });

  describe('Error messages', () => {
    it('shows the expired error message when the appropriate error is thrown', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      fixtures.clerk.handleMagicLinkVerification.mockImplementationOnce(
        await Promise.resolve(() => {
          throw new MagicLinkError(MagicLinkErrorCode.Expired);
        }),
      );

      await runFakeTimers(async timers => {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        timers.runOnlyPendingTimers();
        await waitFor(() => expect(fixtures.clerk.handleMagicLinkVerification).toHaveBeenCalled());
        screen.getByText(/expired/i);
      });
    });

    it('shows the failed error message when the appropriate error is thrown', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      fixtures.clerk.handleMagicLinkVerification.mockImplementationOnce(
        await Promise.resolve(() => {
          throw new MagicLinkError(MagicLinkErrorCode.Failed);
        }),
      );
      await runFakeTimers(async timers => {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        timers.runOnlyPendingTimers();
        await waitFor(() => expect(fixtures.clerk.handleMagicLinkVerification).toHaveBeenCalled());
        screen.getByText(/invalid/i);
      });
    });
  });
});
