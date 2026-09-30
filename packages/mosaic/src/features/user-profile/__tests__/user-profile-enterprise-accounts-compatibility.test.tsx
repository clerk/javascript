import type * as SharedReact from '@clerk/shared/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileEnterpriseAccountsSection } from '../user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section';

const fallbackNavigate = vi.fn();

vi.mock('@clerk/shared/internal/clerk-js/windowNavigate', () => ({
  windowNavigate: (url: URL | string) => fallbackNavigate(url),
}));

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({
      isLoaded: true,
      user: {
        id: 'user_1',
        enterpriseAccounts: [],
        createExternalAccount: () =>
          Promise.resolve({
            verification: { externalVerificationRedirectURL: new URL('https://accounts.example/authorize') },
          }),
      },
    }),
    __internal_useUserEnterpriseConnections: () => ({
      data: [{ id: 'okta', name: 'Acme Okta', allowOrganizationAccountLinking: true }],
    }),
    useClerk: () => ({
      __internal_environment: { userSettings: { enterpriseSSO: { enabled: true } } },
      __internal_getOption: () => undefined,
    }),
  };
});

it('uses the shared navigation fallback when an older Clerk lacks the internal method', async () => {
  render(
    <MosaicProvider>
      <UserProfileEnterpriseAccountsSection />
    </MosaicProvider>,
  );
  await userEvent.setup().click(screen.getByRole('button', { name: 'Connect Acme Okta' }));
  await waitFor(() => expect(fallbackNavigate).toHaveBeenCalledWith(new URL('https://accounts.example/authorize')));
});
