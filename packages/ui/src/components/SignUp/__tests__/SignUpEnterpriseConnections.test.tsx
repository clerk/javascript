import type { SignUpEnterpriseConnectionResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { SignUpEnterpriseConnections } from '../SignUpEnterpriseConnections';

const { createFixtures } = bindCreateFixtures('SignUp');

describe('SignUpEnterpriseConnections', () => {
  it('renders each connection with its logo, or its initial when there is no logo', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress({ required: true });
      f.startSignUpWithEmailAddress();
    });
    fixtures.signUp.__experimental_getEnterpriseConnections = vi.fn().mockResolvedValue([
      {
        id: 'conn_msft',
        name: 'Microsoft Engineering',
        logoPublicUrl: 'https://img.clerk.com/msft.png',
        provider: 'saml_microsoft',
      },
      { id: 'conn_okta', name: 'Okta', logoPublicUrl: null, provider: 'saml_okta' },
    ] as SignUpEnterpriseConnectionResource[]);

    render(<SignUpEnterpriseConnections />, { wrapper });

    await screen.findByText('Choose an account');
    screen.getByText('Select an enterprise account to continue.');

    const logo = screen.getByLabelText("Microsoft Engineering's icon");
    expect(logo).toHaveStyle({ backgroundImage: 'url(https://img.clerk.com/msft.png)' });
    expect(logo).toHaveClass('cl-providerIcon__microsoft');

    const oktaButton = screen.getByRole('button', { name: /Okta/ });
    expect(oktaButton.querySelector('.cl-socialButtonsProviderInitialIcon__okta')).toHaveTextContent('O');
    expect(screen.queryByLabelText("Okta's icon")).not.toBeInTheDocument();
  });
});
