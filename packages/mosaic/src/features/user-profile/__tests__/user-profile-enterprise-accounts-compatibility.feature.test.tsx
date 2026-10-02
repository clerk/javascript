import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiVerification } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';
import { enterpriseAccountSeed } from './enterprise-accounts.fixtures';

it('uses browser navigation when an older Clerk lacks its internal navigator', async () => {
  const originalUrl = window.location.href;
  const redirect = new URL(originalUrl);
  redirect.hash = 'enterprise-compatible';
  serveFapi(
    enterpriseAccountSeed({
      enterpriseLinking: {
        enabled: true,
        preparations: {
          okta: {
            kind: 'saml',
            verification: fapiVerification('saml', {
              status: 'unverified',
              external_verification_redirect_url: redirect.href,
            }),
          },
        },
      },
    }),
  );
  const { clerk } = await renderWithClerk(<UserProfileEnterpriseAccountsSection />);
  const descriptor = Object.getOwnPropertyDescriptor(clerk, '__internal_windowNavigate');
  Object.defineProperty(clerk, '__internal_windowNavigate', { configurable: true, value: undefined });
  try {
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Connect Acme Okta' }));
    await waitFor(() => expect(window.location.href).toBe(redirect.href));
  } finally {
    window.history.replaceState(null, '', originalUrl);
    if (descriptor) {
      Object.defineProperty(clerk, '__internal_windowNavigate', descriptor);
    } else {
      Reflect.deleteProperty(clerk, '__internal_windowNavigate');
    }
  }
});
