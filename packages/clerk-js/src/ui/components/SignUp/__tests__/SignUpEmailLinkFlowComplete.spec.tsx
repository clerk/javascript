import React from 'react';
import { describe, expect, it, vi } from 'vitest';

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
    vi.useFakeTimers();
    try {
      render(<SignUpEmailLinkFlowComplete />, { wrapper });
      vi.runAllTimers();
      await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
    } finally {
      vi.useRealTimers();
    }
  });

  describe('Success', () => {
    it('shows the success message when successfully verified', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress({ required: true });
      });
      vi.useFakeTimers();
      try {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        vi.runAllTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        screen.getByText(/success/i);
      } finally {
        vi.useRealTimers();
      }
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

      vi.useFakeTimers();
      try {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        vi.runAllTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        screen.getByText(/expired/i);
      } finally {
        vi.useRealTimers();
      }
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
      vi.useFakeTimers();
      try {
        render(<SignUpEmailLinkFlowComplete />, { wrapper });
        vi.runAllTimers();
        await waitFor(() => expect(fixtures.clerk.handleEmailLinkVerification).toHaveBeenCalled());
        screen.getByText(/invalid/i);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
