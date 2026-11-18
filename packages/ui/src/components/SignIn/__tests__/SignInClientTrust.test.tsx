import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInClientTrust } from '../SignInClientTrust';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInClientTrust', () => {
  describe('Use another method', () => {
    it('does not render when only one verification factor is available', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInClientTrust({ supportPhoneCode: true });
      });

      fixtures.signIn.prepareSecondFactor.mockResolvedValueOnce({} as SignInResource);
      render(<SignInClientTrust />, { wrapper });

      expect(screen.queryByText('Use another method')).not.toBeInTheDocument();
    });

    it('renders when multiple verification factors are available', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInClientTrust({ supportPhoneCode: true, supportEmailCode: true });
      });

      fixtures.signIn.prepareSecondFactor.mockResolvedValueOnce({} as SignInResource);
      render(<SignInClientTrust />, { wrapper });

      expect(screen.getByText('Use another method')).toBeInTheDocument();
    });
  });

  describe('New device notice', () => {
    const NOTICE = /You're signing in from a new device/i;
    const cases = [
      ['with client_trust_state', 'new'],
      ['without client_trust_state', undefined],
    ] as const;

    it.each(cases)('renders the notice once on the email_code factor %s', async (_, clientTrustState) => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInClientTrust({ supportPhoneCode: false, supportEmailCode: true, clientTrustState });
      });

      fixtures.signIn.prepareSecondFactor.mockResolvedValueOnce({} as SignInResource);
      render(<SignInClientTrust />, { wrapper });

      expect(screen.getAllByText(NOTICE)).toHaveLength(1);
      expect(screen.getAllByText('Check your email').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('otp-input-segment')).toHaveLength(6);
    });

    it.each(cases)('renders the notice once on the phone_code factor %s', async (_, clientTrustState) => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInClientTrust({ supportPhoneCode: true, clientTrustState });
      });

      fixtures.signIn.prepareSecondFactor.mockResolvedValueOnce({} as SignInResource);
      render(<SignInClientTrust />, { wrapper });

      expect(screen.getAllByText(NOTICE)).toHaveLength(1);
      expect(screen.getAllByText('Check your phone').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('otp-input-segment')).toHaveLength(6);
    });

    it.each(cases)('renders the notice once on the email_link factor %s', async (_, clientTrustState) => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInClientTrust({ supportPhoneCode: false, supportEmailLink: true, clientTrustState });
      });

      fixtures.signIn.prepareSecondFactor.mockResolvedValueOnce({} as SignInResource);
      fixtures.signIn.createEmailLinkFlow.mockImplementation(
        () =>
          ({
            startEmailLinkFlow: vi.fn(() => new Promise<SignInResource>(() => {})),
            cancelEmailLinkFlow: vi.fn(),
          }) as any,
      );
      render(<SignInClientTrust />, { wrapper });

      expect(screen.getAllByText(NOTICE)).toHaveLength(1);
      expect(screen.getAllByText('Check your email').length).toBeGreaterThan(0);
      expect(screen.getByText('Use the verification link sent to your email')).toBeInTheDocument();
    });
  });
});
