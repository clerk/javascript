import { ClerkRuntimeError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInFactorOne } from '../SignInFactorOne';
import { SignInFactorOneEnterpriseConnections } from '../SignInFactorOneEnterpriseConnections';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInFactorOneEnterpriseConnections', () => {
  it('renders each connection with its logo, or its initial when there is no logo', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.startSignInWithEnterpriseSSO({
        enterpriseConnections: [
          {
            id: 'conn_msft',
            name: 'Microsoft Engineering',
            logoPublicUrl: 'https://img.clerk.com/msft.png',
            provider: 'saml_microsoft',
          },
          { id: 'conn_okta', name: 'Okta', provider: 'saml_okta' },
        ],
      });
    });

    render(<SignInFactorOne />, { wrapper });

    await screen.findByText('Choose an account');
    screen.getByText('Select an enterprise account to continue.');

    const logo = screen.getByLabelText("Microsoft Engineering's icon");
    expect(logo).toHaveStyle({ backgroundImage: 'url(https://img.clerk.com/msft.png)' });
    expect(logo).toHaveClass('cl-providerIcon__microsoft');

    const oktaButton = screen.getByRole('button', { name: /Okta/ });
    expect(oktaButton.querySelector('.cl-socialButtonsProviderInitialIcon__okta')).toHaveTextContent('O');
    expect(screen.queryByLabelText("Okta's icon")).not.toBeInTheDocument();
  });

  it('renders the logo and initial when the backend omits the provider', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
      f.startSignInWithEnterpriseSSO({
        enterpriseConnections: [
          { id: 'conn_msft', name: 'Microsoft Engineering', logoPublicUrl: 'https://img.clerk.com/msft.png' },
          { id: 'conn_okta', name: 'Okta' },
        ],
      });
    });

    render(<SignInFactorOne />, { wrapper });

    const logo = await screen.findByLabelText("Microsoft Engineering's icon");
    expect(logo).toHaveStyle({ backgroundImage: 'url(https://img.clerk.com/msft.png)' });

    const oktaButton = screen.getByRole('button', { name: /Okta/ });
    expect(oktaButton.querySelector('.cl-socialButtonsProviderInitialIcon')).toHaveTextContent('O');
  });
});

/** Two connections is what puts the user on this card rather than a direct hand-off. */
const TWO_CONNECTIONS = [
  { strategy: 'enterprise_sso', enterpriseConnectionId: 'ent_acme', enterpriseConnectionName: 'Acme SSO' },
  { strategy: 'enterprise_sso', enterpriseConnectionId: 'ent_globex', enterpriseConnectionName: 'Globex SSO' },
];

describe('SignInFactorOneEnterpriseConnections with a challenge', () => {
  it('routes to the challenge when preparing the hand-off raises one', async () => {
    // GIVEN a user choosing between two enterprise connections
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.startSignInWithEmailAddress();
    });
    (fixtures.signIn as unknown as SignInResource).supportedFirstFactors = TWO_CONNECTIONS as never;
    // WHEN preparing the hand-off comes back gated: no redirect is issued and the call throws.
    fixtures.signIn.authenticateWithRedirect.mockImplementationOnce(async () => {
      (fixtures.signIn as any).protectCheck = { status: 'pending', token: 'challenge-token-abc' };
      throw new ClerkRuntimeError('challenge required', { code: 'protect_check_required' });
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
