import type { EmailLinkFactor, SignInResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { CardStateProvider } from '../../../elements/contexts';
import { SignInFactorTwoEmailLinkCard } from '../SignInFactorTwoEmailLinkCard';

const { createFixtures } = bindCreateFixtures('SignIn');

const factor: EmailLinkFactor = {
  strategy: 'email_link',
  emailAddressId: 'idn_123',
  safeIdentifier: 'test@clerk.com',
};

const renderCard = (component: React.ReactElement, options?: any) =>
  render(<CardStateProvider>{component}</CardStateProvider>, options);

describe('SignInFactorTwoEmailLinkCard', () => {
  it('routes to the protect-check card when the link verification resolves gated by Clerk Protect', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withEmailLink();
      f.startSignInWithEmailAddress({ supportEmailLink: true });
    });

    // Unlike the other second-factor cards this one finalizes inline, so a Protect gate on the
    // resolved resource must route to the challenge instead of `setActive`-ing a null session.
    fixtures.signIn.createEmailLinkFlow.mockImplementation(
      () =>
        ({
          startEmailLinkFlow: vi.fn(() =>
            Promise.resolve({
              status: 'needs_protect_check',
              createdSessionId: null,
              secondFactorVerification: {
                status: 'unverified',
                verifiedFromTheSameClient: () => false,
              },
              protectCheck: {
                status: 'pending',
                token: 'challenge-token',
                sdkUrl: 'https://protect.example.com/sdk.js',
              },
            } as unknown as SignInResource),
          ),
          cancelEmailLinkFlow: vi.fn(),
        }) as any,
    );

    renderCard(
      <SignInFactorTwoEmailLinkCard
        factor={factor}
        factorAlreadyPrepared={false}
        onFactorPrepare={vi.fn()}
      />,
      { wrapper },
    );

    await waitFor(() => {
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check');
      // and must not finalize with a null session
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    });
  });
});
