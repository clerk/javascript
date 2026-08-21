import { afterEach, describe, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { UserVerificationEmailLinkVerify } from '../UserVerificationEmailLinkVerify';

const { createFixtures } = bindCreateFixtures('UserVerification');

describe('UserVerificationEmailLinkVerify', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

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
