import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignInFactorOne } from '../SignInFactorOne';

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
