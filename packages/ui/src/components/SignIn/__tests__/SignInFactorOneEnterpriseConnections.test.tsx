import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInFactorOneEnterpriseConnections } from '../SignInFactorOneEnterpriseConnections';

const { createFixtures } = bindCreateFixtures('SignIn');

/** Two connections is what puts the user on this card rather than a direct hand-off. */
const TWO_CONNECTIONS = [
  { strategy: 'enterprise_sso', enterpriseConnectionId: 'ent_acme', enterpriseConnectionName: 'Acme SSO' },
  { strategy: 'enterprise_sso', enterpriseConnectionId: 'ent_globex', enterpriseConnectionName: 'Globex SSO' },
];

describe('SignInFactorOneEnterpriseConnections', () => {
  it('routes to the challenge when preparing the hand-off raises one', async () => {
    // GIVEN a user choosing between two enterprise connections
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.startSignInWithEmailAddress();
    });
    (fixtures.signIn as unknown as SignInResource).supportedFirstFactors = TWO_CONNECTIONS as never;
    // WHEN preparing the hand-off comes back gated: no redirect is issued, the call just resolves.
    fixtures.signIn.authenticateWithRedirect.mockImplementationOnce(() => {
      (fixtures.signIn as any).protectCheck = { status: 'pending', token: 'challenge-token-abc' };
      return Promise.resolve();
    });

    const { userEvent } = render(<SignInFactorOneEnterpriseConnections />, { wrapper });
    await userEvent.click(await screen.findByText('Acme SSO'));

    // THEN the challenge is shown, instead of the card sitting there looking inert.
    await waitFor(() => {
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../protect-check');
    });
    expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ strategy: 'enterprise_sso', enterpriseConnectionId: 'ent_acme' }),
    );
  });

  it('does not route to the challenge when the hand-off is issued normally', async () => {
    // GIVEN the same card, but nothing gates the hand-off
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.startSignInWithEmailAddress();
    });
    (fixtures.signIn as unknown as SignInResource).supportedFirstFactors = TWO_CONNECTIONS as never;
    fixtures.signIn.authenticateWithRedirect.mockResolvedValueOnce(undefined as never);

    const { userEvent } = render(<SignInFactorOneEnterpriseConnections />, { wrapper });
    await userEvent.click(await screen.findByText('Globex SSO'));

    // THEN the redirect owns the navigation and we must not steal it.
    await waitFor(() => {
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalled();
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalledWith('../protect-check');
  });
});
