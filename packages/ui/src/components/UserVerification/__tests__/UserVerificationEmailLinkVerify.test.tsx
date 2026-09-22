import { afterEach, describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { UserVerification } from '../index';
import { UserVerificationEmailLinkVerify } from '../UserVerificationEmailLinkVerify';

const { createFixtures } = bindCreateFixtures('UserVerification');

describe('UserVerificationEmailLinkVerify', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it.each(['verified', 'expired', 'failed', 'client_mismatch'])(
    'renders the %s callback without starting a new verification',
    async status => {
      window.history.replaceState({}, '', `/account/billing?__clerk_status=${status}`);
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.router.matches.mockImplementation(path => path === 'verify');

      const { unmount } = render(<UserVerification />, { wrapper });
      expect(screen.getByRole('heading')).toBeTruthy();
      expect(fixtures.session?.startVerification).not.toHaveBeenCalled();
      expect(fixtures.session?.prepareFirstFactorVerification).not.toHaveBeenCalled();
      unmount();
      expect(fixtures.session?.startVerification).not.toHaveBeenCalled();
    },
  );

  it('tells the user to return to the original protected-action tab after verification', async () => {
    window.history.replaceState({}, '', '/account/billing?__clerk_status=verified');
    const { wrapper } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });

    render(<UserVerificationEmailLinkVerify />, { wrapper });

    screen.getByText('Verification complete');
    screen.getByText('Return to the original tab to continue.');
  });

  it('tells the user to request a new link when the verification link has expired', async () => {
    window.history.replaceState({}, '', '/account/billing?__clerk_status=expired');
    const { wrapper } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });

    render(<UserVerificationEmailLinkVerify />, { wrapper });

    screen.getByText('This verification link has expired');
    screen.getByText('Return to the original tab and request a new link.');
  });
});
